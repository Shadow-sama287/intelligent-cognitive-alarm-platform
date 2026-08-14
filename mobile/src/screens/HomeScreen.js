import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Switch } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { mobileApi } from "../services/api";
import { useTheme, spacing, radius, cardActiveGlow } from "../theme";

export default function HomeScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [alarms, setAlarms] = useState([]);
  const [snoozedSession, setSnoozedSession] = useState(null);
  const [ttlSeconds, setTtlSeconds] = useState(0);

  const loadAlarms = async () => {
    try {
      const res = await mobileApi.get("/alarms");
      setAlarms(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const checkSnoozedSession = async () => {
    try {
      const res = await mobileApi.get("/sessions/active");
      if (res.data?.data && res.data.data.status === "snoozed") {
        setSnoozedSession(res.data.data);
        setTtlSeconds(res.data.data.ttl_seconds || 300);
      } else {
        setSnoozedSession(null);
        setTtlSeconds(0);
      }
    } catch (e) {
      setSnoozedSession(null);
      setTtlSeconds(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
      checkSnoozedSession();
    }, [])
  );

  // Live 1-second interval countdown for TTL timer
  useEffect(() => {
    if (!snoozedSession || ttlSeconds <= 0) return;
    const interval = setInterval(() => {
      setTtlSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          checkSnoozedSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [snoozedSession, ttlSeconds]);

  const formatTtl = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleSwitch = async (id) => {
    try {
      await mobileApi.put(`/alarms/${id}/toggle`);
      loadAlarms();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={s.container}>
      {snoozedSession && (
        <View style={s.snoozeBanner}>
          <View style={s.snoozeBannerHeader}>
            <Text style={s.snoozeBannerTitle}>⏰ Alarm Snoozed</Text>
            <View style={s.ttlBadge}><Text style={s.ttlBadgeText}>{formatTtl(ttlSeconds)}</Text></View>
          </View>
          <Text style={s.snoozeBannerSub}>Challenge re-rings in {formatTtl(ttlSeconds)}</Text>
        </View>
      )}
      <Text style={s.heading}>Your Alarms</Text>
      {alarms.length === 0 ? (
        <Text style={s.emptyText}>No alarms set. Go to Alarms tab to add one.</Text>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[s.card, item.is_active && cardActiveGlow]}>
              <View>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.time}>{item.alarm_time}</Text>
                <Text style={s.subText}>{item.challenge_category.toUpperCase()} • {item.days_of_week}</Text>
              </View>
              <Switch
                value={item.is_active}
                onValueChange={() => toggleSwitch(item.id)}
                trackColor={{ false: colors.outlineVariant, true: colors.primary }}
                thumbColor={item.is_active ? colors.onPrimary : colors.onSurfaceVariant}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.md,
    backgroundColor: colors.background,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: spacing.md,
    color: colors.onSurface,
  },
  snoozeBanner: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1.5,
    borderColor: colors.amberAccent,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.amberAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  snoozeBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  snoozeBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.amberAccent,
  },
  ttlBadge: {
    backgroundColor: colors.amberAccent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  ttlBadgeText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  snoozeBannerSub: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  card: {
    padding: 18,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  time: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  subText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 40,
  }
  })
}