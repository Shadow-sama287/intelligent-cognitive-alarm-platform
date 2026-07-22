import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function HabitsScreen() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await mobileApi.get('/analytics/summary');
        if (res.data && res.data.data) {
          setScore(res.data.data.habit_score || 0);
          setStreak(res.data.data.streak_days || 0); // Fallback to 0 if not provided
        }
      } catch (err) {
        console.error("Failed to fetch habits", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Habit Consistency</Text>

        <View style={styles.streakCard}>
          <Text style={styles.flameEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{streak} Days</Text>
          <Text style={styles.streakSub}>Consistent Wake-Up Streak!</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.scoreTitle}>HABIT SCORE</Text>
          <Text style={styles.scoreText}>{score} / 100</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  content: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20 },
  streakCard: {
    backgroundColor: '#311b92',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  flameEmoji: { fontSize: 48 },
  streakCount: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginVertical: 4 },
  streakSub: { fontSize: 14, color: '#b388ff' },
  card: { backgroundColor: colors.cardBg, padding: 20, borderRadius: 16, width: '100%', alignItems: 'center' },
  scoreTitle: { fontSize: 12, color: colors.textSecondary },
  scoreText: { fontSize: 36, fontWeight: 'bold', color: colors.primary, marginTop: 4 },
});