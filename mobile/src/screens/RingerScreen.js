import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { Audio } from "expo-av";
import { mobileApi } from "../services/api";
import SnoozePenaltyBanner from "./AntiSnoozeScreen";

export default function RingerScreen({ visible, sessionData, onDismissSuccess, stopSoundExternally }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [snoozing, setSnoozing] = useState(false);
  const [localSound, setLocalSound] = useState(null);

  // Play alarm sound locally ONLY IF no external sound controller is provided
  useEffect(() => {
    let soundObject = null;

    async function playAlarmSound() {
      if (visible && !stopSoundExternally) {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            staysActiveInBackground: true,
          });

          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" },
            { shouldPlay: true, isLooping: true, volume: 1.0 }
          );

          soundObject = newSound;
          setLocalSound(newSound);
        } catch (error) {
          console.error("Failed to load or play alarm sound:", error);
        }
      }
    }

    playAlarmSound();

    return () => {
      if (soundObject) {
        soundObject.stopAsync();
        soundObject.unloadAsync();
      }
    };
  }, [visible, stopSoundExternally]);

  const stopSound = async () => {
    if (stopSoundExternally) {
      await stopSoundExternally();
    } else if (localSound) {
      try {
        await localSound.stopAsync();
        await localSound.unloadAsync();
      } catch (e) {
        console.error("Error stopping local sound:", e);
      }
    }
  };

  const [attempts, setAttempts] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (visible) {
      setStartTime(Date.now());
      setAttempts(1);
    }
  }, [visible]);

  if (!sessionData) return null;
  const challenge = sessionData.challenge;

  const handleSnooze = async () => {
    try {
      setSnoozing(true);
      await stopSound();

      if (sessionData.is_local || !sessionData.session_id) {
        Alert.alert("Alarm Snoozed", "Alarm snoozed for 5 minutes. Get ready!");
        setAnswer("");
        if (onDismissSuccess) {
          onDismissSuccess();
        }
        return;
      }

      // Online Backend Snooze with DDA penalty
      const response = await mobileApi.post("/sessions/snooze", null, {
        params: { session_id: sessionData.session_id }
      });

      const message = response.data?.message || "Alarm snoozed successfully!";
      Alert.alert("Alarm Snoozed", message);

      setAnswer("");
      if (onDismissSuccess) {
        onDismissSuccess();
      }
    } catch (error) {
      console.error("Snooze Error:", error.response?.data || error);
      const detail = error.response?.data?.detail || "Unable to snooze alarm.";
      
      // If backend session expired in Redis, fallback gracefully to local snooze
      if (error.response?.status === 404 && detail.includes("Session expired")) {
        Alert.alert("Alarm Snoozed", "Alarm snoozed for 5 minutes. Get ready!");
        setAnswer("");
        if (onDismissSuccess) {
          onDismissSuccess();
        }
        return;
      }

      Alert.alert("Snooze Denied", detail);
    } finally {
      setSnoozing(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert("Validation", "Please enter your answer.");
      return;
    }

    // Handle Local Offline Challenge Verification
    if (sessionData.is_local || challenge?.is_local) {
      const userAns = answer.trim().toLowerCase();
      const correctAns = String(challenge?.correct_answer || '').trim().toLowerCase();

      if (userAns === correctAns) {
        await stopSound();
        const solveTimeSeconds = Math.round((Date.now() - startTime) / 1000) || 5;

        // Queue solve telemetry locally for auto-sync when online
        const { queueOfflineTelemetry } = require('../services/offlineTelemetryService');
        await queueOfflineTelemetry({
          category: challenge?.category || 'math',
          difficulty: challenge?.difficulty || 'medium',
          solve_time_seconds: solveTimeSeconds,
          attempts: attempts,
          snooze_count: 0,
          timestamp: new Date().toISOString(),
        });

        Alert.alert(
          "Alarm Dismissed!",
          `Great job! Solved offline in ${solveTimeSeconds} seconds.`
        );

        setAnswer("");
        if (onDismissSuccess) {
          onDismissSuccess();
        }
      } else {
        setAttempts(prev => prev + 1);
        setAnswer("");
        Alert.alert("Incorrect", "Wrong answer! Alarm keeps ringing!");
      }
      return;
    }

    // Handle Online Server Challenge Verification
    try {
      setLoading(true);
      const response = await mobileApi.post("/challenges/verify", {
        session_id: sessionData.session_id,
        user_answer: answer.trim(),
      });

      const result = response.data.data;

      if (result.is_correct) {
        await stopSound(); // Stop ringing sound on correct answer

        Alert.alert(
          "Alarm Dismissed!",
          `Great job! Solved in ${result.time_taken_seconds} seconds.`
        );

        setAnswer("");
        if (onDismissSuccess) {
          onDismissSuccess();
        }
      } else {
        setAnswer("");
        Alert.alert("Incorrect", "Wrong answer! Alarm keeps ringing!");
      }
    } catch (error) {
      console.error(error.response?.data || error);
      Alert.alert("Verification Failed", error.response?.data?.detail || "Unable to verify answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={() => {}}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>⏰ Wake Up!</Text>
          <Text style={styles.subtitle}>Solve the challenge to dismiss the alarm</Text>

          {sessionData?.snooze_count > 0 && (
            <SnoozePenaltyBanner
              snoozeCount={sessionData.snooze_count}
              currentDifficulty={sessionData.difficulty || challenge?.difficulty || "hard"}
              timeLimitSeconds={sessionData.time_penalty_seconds || sessionData.time_limit_seconds || 30}
            />
          )}
          
          <View style={styles.challengeBox}>
            <Text style={styles.challengeText}>
              {challenge?.prompt || "Loading challenge..."}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter your answer"
            value={answer}
            onChangeText={setAnswer}
            autoCapitalize="none"
            autoFocus
          />

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.button, (loading || snoozing) && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading || snoozing}
            >
              <Text style={styles.buttonText}>{loading ? "Verifying..." : "Submit Answer"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.snoozeButton, (loading || snoozing) && { opacity: 0.7 }]}
              onPress={handleSnooze}
              disabled={loading || snoozing}
            >
              <Text style={styles.snoozeButtonText}>{snoozing ? "Snoozing..." : "💤 Snooze (5 min)"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center" },
  content: { padding: 24, alignItems: "center" },
  title: { fontSize: 34, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 30 },
  challengeBox: { width: "100%", padding: 25, borderRadius: 16, backgroundColor: "#fff", elevation: 3, marginBottom: 25 },
  challengeText: { fontSize: 28, fontWeight: "600", textAlign: "center" },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 15, fontSize: 22, textAlign: "center", backgroundColor: "#fff", marginBottom: 25 },
  actionContainer: { width: "100%", gap: 12 },
  button: { width: "100%", backgroundColor: "#2563EB", padding: 16, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  snoozeButton: { width: "100%", backgroundColor: "#FFF7ED", borderWidth: 1.5, borderColor: "#F59E0B", padding: 15, borderRadius: 12, alignItems: "center" },
  snoozeButtonText: { color: "#D97706", fontWeight: "bold", fontSize: 17 },
});
