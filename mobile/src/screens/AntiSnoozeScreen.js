import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import StreakHeader from "../components/StreakHeader";

export default function AntiSnoozeScreen({
  currentStreak,
  requiredStreak,
  challenge,
}) {
    
  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.screenTitle}>Anti-Snooze Challenge</Text>
      <StreakHeader
  currentStreak={currentStreak}
  requiredStreak={requiredStreak}
/>
      <View style={styles.challengeCard}>
        <Text style={styles.sectionTitle}>
        🧠 Current Challenge
        </Text>
        <Text style={styles.challengeText}>
        {challenge?.prompt}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          🛎 Alarm Status
        </Text>

        <Text style={styles.infoText}>
          Stay focused! Solve every remaining challenge consecutively to dismiss your alarm.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

    screenTitle: {
        marginTop: 40,
  fontSize: 28,
  fontWeight: "bold",
  marginBottom: 20,
  color: "#222",
},

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  challengeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginTop: 28,
    shadowColor: "#000",
shadowOffset: {
  width: 0,
  height: 2,
},
shadowOpacity: 0.08,
shadowRadius: 6,
elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },

  challengeText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2563EB",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    elevation: 2,
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },

  infoText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
});