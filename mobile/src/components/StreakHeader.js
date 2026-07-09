import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StreakHeader({
  currentStreak,
  requiredStreak,
}) {
  const progress =
    requiredStreak > 0
      ? (currentStreak / requiredStreak) * 100
      : 0;

  const remaining = requiredStreak - currentStreak;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Keep Going!</Text>

      <Text style={styles.subtitle}>
        Puzzle {currentStreak} of {requiredStreak}
      </Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.remaining}>
  {remaining > 0
    ? `Only ${remaining} puzzle${remaining > 1 ? "s" : ""} left!`
    : "Great job! Streak complete 🎉"}
</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    elevation: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },

  progressBackground: {
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
  },

  remaining: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
});