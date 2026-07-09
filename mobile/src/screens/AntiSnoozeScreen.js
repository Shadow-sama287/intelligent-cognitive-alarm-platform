import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function SnoozePenaltyBanner({ snoozeCount, currentDifficulty, timeLimitSeconds }) {
  if (!snoozeCount || snoozeCount === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.warningLabel}>⚠️ SNOOZE PENALTY ACTIVE ({snoozeCount}/3)</Text>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>DIFFICULTY</Text>
          <Text style={styles.detailValue}>{currentDifficulty.toUpperCase()}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>TIME LIMIT</Text>
          <Text style={[styles.detailValue, { color: '#f43f5e' }]}>{timeLimitSeconds}s</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginVertical: 16, backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.3)' },
  warningLabel: { fontSize: 12, fontWeight: 'bold', color: '#f43f5e', letterSpacing: 1, marginBottom: 12, textAlign: 'center' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailBox: { flex: 1, alignItems: 'center' },
  detailTitle: { fontSize: 10, color: colors.textSecondary, marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '900', color: colors.textPrimary },
});