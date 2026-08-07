import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Switch } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { mobileApi } from "../services/api";

export default function HomeScreen() {
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
    <View style={styles.container}>
      <Text style={styles.heading}>My Dashboard</Text>

      {snoozedSession && (
        <View style={styles.snoozeBanner}>
          <View style={styles.snoozeBannerHeader}>
            <Text style={styles.snoozeBannerTitle}>💤 Alarm Snoozed</Text>
            <View style={styles.ttlBadge}>
              <Text style={styles.ttlBadgeText}>⏱ {formatTtl(ttlSeconds)}</Text>
            </View>
          </View>
          <Text style={styles.snoozeBannerSub}>
            Snooze limit: ({snoozedSession.snooze_count || 1}/3) • Re-rings at {(snoozedSession.difficulty || 'expert').toUpperCase()} level
          </Text>
        </View>
      )}

      {alarms.length === 0 ? (
        <Text style={styles.emptyText}>You have no alarms set. Go to the Alarms tab to add one!</Text>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.alarm_time}</Text>
                <Text style={styles.subText}>{item.challenge_category.toUpperCase()} • {item.days_of_week}</Text>
              </View>
              <Switch
                value={item.is_active}
                onValueChange={() => toggleSwitch(item.id)}
                trackColor={{ false: "#ccc", true: "#007BFF" }}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  snoozeBanner: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#F59E0B',
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
    color: '#D97706',
  },
  ttlBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  ttlBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  snoozeBannerSub: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  card: {
    padding: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  time: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },
  subText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 40,
  }
});