import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator,
  ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useTheme, spacing, radius, cardActiveGlow } from '../theme';
import { mobileApi } from '../services/api';

const CATEGORY_META = {
  math:    { label: 'Math',    emoji: '➗', colorKey: 'challengeMath'   },
  logic:   { label: 'Logic',   emoji: '🧩', colorKey: 'challengeLogic'  },
  memory:  { label: 'Memory',  emoji: '🧠', colorKey: 'challengeMemory' },
  word:    { label: 'Word',    emoji: '📝', colorKey: 'amberAccent'     },
  pattern: { label: 'Pattern', emoji: '🔷', colorKey: 'tertiary'        },
  riddles: { label: 'Riddles', emoji: '❓', colorKey: 'secondary'       },
  trivia:  { label: 'Trivia',  emoji: '💡', colorKey: 'sageSuccess'     },
};

const DIFFICULTY_ORDER = ['beginner', 'easy', 'medium', 'hard', 'expert'];
const DIFFICULTY_COLORS = {
  beginner: '#87a878', easy: '#87a878', medium: '#f59e0b', hard: '#fb7185', expert: '#ffb4ab',
};

export default function HabitsScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [summary, setSummary]           = useState(null);
  const [perfAnalytics, setPerfAnalytics] = useState(null);
  const [history, setHistory]           = useState([]);
  const [recommendations, setRecs]      = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [recsExpanded, setRecsExpanded] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [summaryRes, perfRes, histRes, recsRes] = await Promise.allSettled([
        mobileApi.get('/analytics/summary'),
        mobileApi.get('/performance/analytics'),
        mobileApi.get('/performance/history?limit=5'),
        mobileApi.get('/analytics/recommendations'),
      ]);

      if (summaryRes.status === 'fulfilled')  setSummary(summaryRes.value.data.data);
      if (perfRes.status === 'fulfilled')     setPerfAnalytics(perfRes.value.data.data);
      if (histRes.status === 'fulfilled')     setHistory(histRes.value.data.data || []);
      if (recsRes.status === 'fulfilled')     setRecs(recsRes.value.data.data || []);
    } catch (err) {
      console.error('[HabitsScreen] fetchAll error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading your progress…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────
  const streak    = summary?.streak_days || 0;
  const score     = summary?.habit_score || 0;
  const totalSolved  = perfAnalytics?.total_solved || 0;
  const avgTime      = perfAnalytics?.avg_solve_time;
  const byCategory   = perfAnalytics?.by_category || [];
  const maxCatCount  = Math.max(...byCategory.map(c => c.count), 1);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >

        {/* ── Section: Hero Streak ─────────────────────────────── */}
        <View style={s.streakCard}>
          <Text style={s.streakFlame}>🔥</Text>
          <Text style={s.streakCount}>{streak}</Text>
          <Text style={s.streakLabel}>Day{streak !== 1 ? 's' : ''} Streak</Text>
          <Text style={s.streakSub}>Consistent wake-up champion!</Text>
        </View>

        {/* ── Section: Stat Row ────────────────────────────────── */}
        <View style={s.statRow}>
          <View style={s.statCard}>
            <Text style={s.statEmoji}>🎯</Text>
            <Text style={s.statValue}>{score}<Text style={s.statUnit}>/100</Text></Text>
            <Text style={s.statLabel}>Habit Score</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statEmoji}>✅</Text>
            <Text style={s.statValue}>{totalSolved}</Text>
            <Text style={s.statLabel}>Challenges Solved</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statEmoji}>⚡</Text>
            <Text style={s.statValue}>
              {avgTime != null ? `${avgTime}` : '—'}<Text style={s.statUnit}>{avgTime != null ? 's' : ''}</Text>
            </Text>
            <Text style={s.statLabel}>Avg. Solve Time</Text>
          </View>
        </View>

        {/* ── Section: Category Breakdown ──────────────────────── */}
        {byCategory.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Challenge Breakdown</Text>
            {byCategory.map((cat) => {
              const meta = CATEGORY_META[cat.category] || { label: cat.category, emoji: '🎲', colorKey: 'primary' };
              const barColor = colors[meta.colorKey] || colors.primary;
              const barWidth = `${Math.round((cat.count / maxCatCount) * 100)}%`;
              return (
                <View key={cat.category} style={s.barRow}>
                  <Text style={s.barEmoji}>{meta.emoji}</Text>
                  <Text style={s.barLabel}>{meta.label}</Text>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: barWidth, backgroundColor: barColor }]} />
                  </View>
                  <Text style={[s.barCount, { color: barColor }]}>{cat.count}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Section: Recent History ───────────────────────────── */}
        {history.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Recent Solves</Text>
            {history.map((entry, i) => {
              const meta = CATEGORY_META[entry.category] || { label: entry.category, emoji: '🎲', colorKey: 'primary' };
              const catColor = colors[meta.colorKey] || colors.primary;
              const diffColor = DIFFICULTY_COLORS[entry.difficulty] || colors.onSurfaceVariant;
              const date = new Date(entry.solved_at);
              const timeAgo = formatTimeAgo(date);
              return (
                <View key={entry.id} style={[s.historyRow, i < history.length - 1 && s.historyRowBorder]}>
                  <View style={[s.historyBadge, { backgroundColor: catColor + '22', borderColor: catColor }]}>
                    <Text style={s.historyBadgeEmoji}>{meta.emoji}</Text>
                  </View>
                  <View style={s.historyInfo}>
                    <Text style={s.historyCategory}>{meta.label}</Text>
                    <Text style={s.historyMeta}>{timeAgo}</Text>
                  </View>
                  <View style={s.historyRight}>
                    <Text style={[s.historyDiff, { color: diffColor }]}>{entry.difficulty}</Text>
                    <Text style={s.historyTime}>{entry.time_taken_seconds}s</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Section: AI Recommendations ──────────────────────── */}
        {recommendations.length > 0 && (
          <TouchableOpacity style={s.card} onPress={() => setRecsExpanded(!recsExpanded)} activeOpacity={0.8}>
            <View style={s.recsHeader}>
              <Text style={s.cardTitle}>💡 AI Recommendations</Text>
              <Text style={s.recsChevron}>{recsExpanded ? '▲' : '▼'}</Text>
            </View>
            {recsExpanded && (
              <View style={s.recsList}>
                {recommendations.map((rec, i) => (
                  <View key={i} style={s.recRow}>
                    <View style={s.recBullet} />
                    <Text style={s.recText}>{typeof rec === 'string' ? rec : rec.message || JSON.stringify(rec)}</Text>
                  </View>
                ))}
              </View>
            )}
            {!recsExpanded && (
              <Text style={s.recsPeek}>{recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} available — tap to expand</Text>
            )}
          </TouchableOpacity>
        )}

        {/* ── Empty state ───────────────────────────────────────── */}
        {totalSolved === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>🚀</Text>
            <Text style={s.emptyTitle}>No data yet!</Text>
            <Text style={s.emptyText}>Complete your first alarm challenge to see your analytics here.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Time-ago helper ─────────────────────────────────────────────────────────
function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)  return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ── Dynamic styles (re-created when theme changes) ──────────────────────────
function makeStyles(colors) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.background },
    centered:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText:  { color: colors.onSurfaceVariant, fontSize: 14, marginTop: 12 },
    scroll:       { padding: spacing.md, paddingBottom: 40 },

    // ── Streak hero ──
    streakCard: {
      alignItems: 'center',
      backgroundColor: colors.tertiaryContainer,
      borderRadius: radius.xl,
      paddingVertical: spacing.xl,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      shadowColor: colors.tertiary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    streakFlame: { fontSize: 52, marginBottom: 4 },
    streakCount: { fontSize: 56, fontWeight: '900', color: colors.onSurface, lineHeight: 64 },
    streakLabel: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 4 },
    streakSub:   { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4, fontStyle: 'italic' },

    // ── Stat row ──
    statRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.md },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: 14,
      alignItems: 'center',
    },
    statEmoji: { fontSize: 22, marginBottom: 6 },
    statValue: { fontSize: 22, fontWeight: '800', color: colors.onSurface },
    statUnit:  { fontSize: 13, fontWeight: '400', color: colors.onSurfaceVariant },
    statLabel: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center', letterSpacing: 0.3 },

    // ── Generic card ──
    card: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: colors.onSurface, marginBottom: spacing.sm },

    // ── Category bars ──
    barRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    barEmoji: { fontSize: 16, width: 24 },
    barLabel: { fontSize: 13, color: colors.onSurfaceVariant, width: 54, fontWeight: '600' },
    barTrack: {
      flex: 1,
      height: 8,
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.full,
      overflow: 'hidden',
      marginHorizontal: 8,
    },
    barFill:  { height: '100%', borderRadius: radius.full },
    barCount: { fontSize: 13, fontWeight: '700', width: 24, textAlign: 'right' },

    // ── History ──
    historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    historyRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
    historyBadge: {
      width: 40, height: 40, borderRadius: radius.sm,
      borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    historyBadgeEmoji: { fontSize: 18 },
    historyInfo:    { flex: 1 },
    historyCategory: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
    historyMeta:    { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
    historyRight:   { alignItems: 'flex-end' },
    historyDiff:    { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    historyTime:    { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 },

    // ── Recommendations ──
    recsHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 },
    recsChevron:  { fontSize: 12, color: colors.onSurfaceVariant },
    recsPeek:     { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 6, fontStyle: 'italic' },
    recsList:     { marginTop: spacing.sm },
    recRow:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    recBullet:    { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6, marginRight: 10 },
    recText:      { flex: 1, fontSize: 14, color: colors.onSurface, lineHeight: 20 },

    // ── Empty ──
    emptyCard: {
      alignItems: 'center', padding: spacing.xl,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.outlineVariant,
    },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface, marginBottom: 6 },
    emptyText:  { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  });
}