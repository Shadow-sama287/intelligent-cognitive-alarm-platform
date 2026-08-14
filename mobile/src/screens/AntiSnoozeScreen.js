import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, radius } from '../theme';

export default function SnoozePenaltyBanner({ snoozeCount, currentDifficulty, timeLimitSeconds }) {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  if (!snoozeCount || snoozeCount === 0) return null;

  return (
    <View style={s.container}>
      <Text style={s.warningLabel}>⚠️ SNOOZE PENALTY ACTIVE ({snoozeCount}/3)</Text>
      <View style={s.detailsRow}>
        <View style={s.detailBox}>
          <Text style={s.detailTitle}>DIFFICULTY</Text>
          <Text style={s.detailValue}>{currentDifficulty.toUpperCase()}</Text>
        </View>
        <View style={s.detailBox}>
          <Text style={s.detailTitle}>TIME LIMIT</Text>
          <Text style={[s.detailValue, { color: colors.error }]}>{timeLimitSeconds}s</Text>
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container:    { width: '100%', marginVertical: 16, backgroundColor: colors.surfaceContainerHigh, padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colors.error },
    warningLabel: { fontSize: 12, fontWeight: 'bold', color: colors.error, letterSpacing: 1, marginBottom: 12, textAlign: 'center' },
    detailsRow:   { flexDirection: 'row', justifyContent: 'space-between' },
    detailBox:    { flex: 1, alignItems: 'center' },
    detailTitle:  { fontSize: 10, color: colors.onSurfaceVariant, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
    detailValue:  { fontSize: 16, fontWeight: '900', color: colors.onSurface },
  });
}
