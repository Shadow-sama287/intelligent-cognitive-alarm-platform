import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import notifee, { EventType } from "@notifee/react-native";
import { Audio } from "expo-av";
import RingerScreen from "../screens/RingerScreen";
import {
  startRedisSessionForAlarm,
  cancelNotificationById,
  cancelAllDisplayedNotifications,
} from "../services/notificationService";
import { generateLocalChallenge } from "../services/localChallengeEngine";

export default function GlobalAlarmManager({ children }) {
  const [ringerVisible, setRingerVisible] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const soundRef = useRef(null);
  const isRinging = useRef(false);

  // Helper to start looping alarm ringtone audio
  const startRingtone = async () => {
    try {
      if (soundRef.current) {
        await stopRingtone();
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );

      soundRef.current = sound;
      console.log("[GlobalAlarmManager] Ringtone started successfully");
    } catch (error) {
      console.error("[GlobalAlarmManager] Error playing ringtone:", error);
    }
  };

  // Helper to stop ringtone audio
  const stopRingtone = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        console.log("[GlobalAlarmManager] Ringtone stopped");
      } catch (e) {
        console.error("[GlobalAlarmManager] Error stopping ringtone:", e);
      }
    }
  };

  // Process an alarm notification trigger
  const handleAlarmTrigger = async (notification, isInteractivePress = false) => {
    const alarmId = notification?.data?.alarm_id;
    const notificationId = notification?.id;

    if (!alarmId) return;
    if (isRinging.current) {
      console.log(`[GlobalAlarmManager] Alarm ${alarmId} already ringing, ignoring duplicate trigger.`);
      return;
    }
    isRinging.current = true;

    console.log(`[GlobalAlarmManager] Processing alarm trigger for alarm_id: ${alarmId}`);

    // If user explicitly tapped notification banner or action, clear notification
    if (isInteractivePress && notificationId) {
      await cancelNotificationById(notificationId);
    }

    // 1. Start looping ringtone sound immediately
    await startRingtone();

    // 2. Fetch backend challenge session, or generate fallback if offline/backend fails
    let session;
    const category = notification?.data?.category || "math";
    try {
      session = await startRedisSessionForAlarm(alarmId, category);
    } catch (error) {
      console.log('[GlobalAlarmManager] Falling back to local challenge due to backend error');
      const localChallenge = generateLocalChallenge(category, 'medium');
      session = {
        session_id: `local-session-${Date.now()}`,
        is_local: true,
        alarm_id: alarmId,
        challenge: localChallenge,
      };
    }

    // 3. Open full-screen Ringer Screen modal
    setSessionData(session);
    setRingerVisible(true);
  };

  useEffect(() => {
    // 1. Handle notification tap/launch when app was completely closed
    notifee.getInitialNotification().then(async (initial) => {
      if (initial?.notification?.data?.alarm_id) {
        console.log("[GlobalAlarmManager] App opened from initial notification");
        await handleAlarmTrigger(initial.notification, true);
      }
    }).catch(console.error);

    // 2. Listen for foreground notification events (when app is open or opened via full-screen intent)
    const unsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
      const { notification } = detail;

      const isAlarmTriggerEvent =
        type === EventType.DELIVERED ||
        type === EventType.PRESS ||
        type === EventType.ACTION_PRESS;

      if (isAlarmTriggerEvent && notification?.data?.alarm_id) {
        console.log(`[GlobalAlarmManager] Foreground event received (type: ${type})`);
        const isPress = type === EventType.PRESS || type === EventType.ACTION_PRESS;
        await handleAlarmTrigger(notification, isPress);
      }
    });

    return () => {
      unsubscribe();
      stopRingtone();
    };
  }, []);

  const handleDismissSuccess = async () => {
    console.log("[GlobalAlarmManager] Alarm solved and dismissed");
    await stopRingtone();
    await cancelAllDisplayedNotifications();
    isRinging.current = false;
    setRingerVisible(false);
    setSessionData(null);
  };

  return (
    <View style={styles.container}>
      {children}
      <RingerScreen
        visible={ringerVisible}
        sessionData={sessionData}
        onDismissSuccess={handleDismissSuccess}
        stopSoundExternally={stopRingtone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
