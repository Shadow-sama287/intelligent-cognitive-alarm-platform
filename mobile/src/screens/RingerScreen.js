import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { mobileApi } from "../services/api";

export default function RingerScreen({
  visible,
  sessionData,
  onDismissSuccess,
}) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Don't render until session data is available
  if (!sessionData) return null;

  const challenge = sessionData.challenge;
  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert("Validation", "Please enter your answer.");
      return;
    }

    try {
      setLoading(true);

      const response = await mobileApi.post("/challenges/verify", {
        session_id: sessionData.session_id,
        user_answer: answer.trim(),
      });

      const result = response.data.data;

      if (result.is_correct) {
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

        Alert.alert(
          "Incorrect",
          "Wrong answer! Alarm keeps ringing!"
        );
      }
    } catch (error) {
      console.error(error.response?.data || error);

      Alert.alert(
  "Verification Failed",
  error.response?.data?.detail ||
  "Unable to verify your answer."
);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
  visible={visible}
  animationType="slide"
  transparent={false}
  onRequestClose={() => {}}
>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>⏰ Wake Up!</Text>

          <Text style={styles.subtitle}>
            Solve the challenge to dismiss the alarm
          </Text>

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

          <TouchableOpacity
            style={[
              styles.button,
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
  },

  content: {
    padding: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },

  challengeBox: {
    width: "100%",
    padding: 25,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    elevation: 3,
    marginBottom: 30,
  },

  challengeText: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 15,
    fontSize: 22,
    textAlign: "center",
    backgroundColor: "#fff",
    marginBottom: 30,
  },

  button: {
    width: "100%",
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});