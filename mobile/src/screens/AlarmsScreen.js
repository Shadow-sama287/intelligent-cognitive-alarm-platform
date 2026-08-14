import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, StyleSheet, FlatList, Switch, SafeAreaView, 
  TouchableOpacity, Modal, TextInput, Button, Alert 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { mobileApi } from "../services/api";
import RingerScreen from "./RingerScreen";
import {
  requestNotificationPermissions,
  syncAllAlarms,
  triggerTestAlarm,
  startRedisSessionForAlarm,
} from "../services/notificationService";
import { useTheme, spacing, radius, cardActiveGlow } from "../theme";

const DAYS_OPTIONS = [
  { label: 'M', value: 'MON' },
  { label: 'T', value: 'TUE' },
  { label: 'W', value: 'WED' },
  { label: 'T', value: 'THU' },
  { label: 'F', value: 'FRI' },
  { label: 'S', value: 'SAT' },
  { label: 'S', value: 'SUN' },
];

export default function AlarmsScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [alarms, setAlarms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState(null);
  const [ringerVisible, setRingerVisible] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  //const [startingSession, setStartingSession] = useState(false);
  // Alarm Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("07:00");
  const [selectedDays, setSelectedDays] = useState(["MON", "TUE", "WED", "THU", "FRI"]);
  const [newCategory, setNewCategory] = useState("math");

  // ── Request Notification Permissions ──
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  // ── Load Alarms & Sync with OS Notifications ──

  const loadAlarms = async () => {
    try {
      const res = await mobileApi.get("/alarms");
      const fetchedAlarms = res.data.data;
      setAlarms(fetchedAlarms);
      // Sync DB alarms with OS-level Notifee triggers
      await syncAllAlarms(fetchedAlarms);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const toggleSwitch = async (id) => {
    try {
      await mobileApi.put(`/alarms/${id}/toggle`);
      loadAlarms();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDay = (dayValue) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue) 
        : [...prev, dayValue]
    );
  };

  const openAddModal = () => {
    setEditingAlarmId(null);
    setNewTitle("");
    setNewTime("07:00");
    setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
    setNewCategory("math");
    setModalVisible(true);
  };

  const openEditModal = (alarm) => {
    setEditingAlarmId(alarm.id);
    setNewTitle(alarm.title || "");
    setNewTime(alarm.alarm_time);
    setSelectedDays(alarm.days_of_week ? alarm.days_of_week.split(",") : []);
    setNewCategory(alarm.challenge_category || "math");
    setModalVisible(true);
  };

  const handleDeleteAlarm = (id) => {
    Alert.alert(
      "Delete Alarm",
      "Are you sure you want to delete this alarm?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await mobileApi.delete(`/alarms/${id}`);
              loadAlarms();
            } catch (e) {
              Alert.alert("Error", "Could not delete alarm");
              console.error(e);
            }
          }
        }
      ]
    );
  };

  const handleSaveAlarm = async () => {
    if (selectedDays.length === 0) {
      Alert.alert("Validation Error", "Please select at least one day.");
      return;
    }

    try {
      const payload = {
        title: newTitle || "Morning Alarm",
        alarm_time: newTime,
        days_of_week: selectedDays.join(","),
        challenge_category: newCategory,
        snooze_limit: 3
      };

      if (editingAlarmId) {
        await mobileApi.put(`/alarms/${editingAlarmId}`, payload);
      } else {
        payload.is_active = true;
        await mobileApi.post("/alarms", payload);
      }
      
      setModalVisible(false);
      loadAlarms();
    } catch (e) {
      Alert.alert("Error", "Could not save alarm");
      console.error(e);
    }
  };
  // ── Auto Sync Pending Telemetry on Load ──
  useEffect(() => {
    const { syncOfflineTelemetry } = require("../services/offlineTelemetryService");
    syncOfflineTelemetry();
  }, []);

  const startAlarmSession = async (alarm) => {
    try {
      const response = await mobileApi.post("/sessions/start", null, {
        params: {
          alarm_id: alarm.id,
          category: alarm.challenge_category,
        },
        timeout: 10000,
      });

      // Thread alarm fields into sessionData so RingerScreen can build snooze notification object (Q2 fix)
      setSessionData({
        ...response.data.data,
        alarm_id: alarm.id,
        alarm_title: alarm.title,
        category: alarm.challenge_category,
      });
      setRingerVisible(true);
    } catch (error) {
      console.log("[AlarmSession] Online session unavailable/offline. Generating local challenge fallback:", error?.message);

      const { generateLocalChallenge } = require("../services/localChallengeEngine");
      const localChallenge = generateLocalChallenge(
        alarm.challenge_category || 'math',
        alarm.difficulty_override || 'medium'
      );

      setSessionData({
        session_id: `local-session-${Date.now()}`,
        is_local: true,
        challenge: localChallenge,
        alarm_id: alarm.id,
        alarm_title: alarm.title,
        category: alarm.challenge_category,
      });
      setRingerVisible(true);
    }
  };

  // ── Test 5-Second Local Alarm Notification ──
  const handleTestNotification = async () => {
    const targetAlarm = alarms.length > 0
      ? alarms[0]
      : { id: 1, title: "Test Alarm", challenge_category: "math" };
    await triggerTestAlarm(targetAlarm, 5);
    Alert.alert(
      "⏰ Test Alarm Scheduled!",
      "A local notification will trigger in 5 seconds.\n\nMinimize/background your app now to test notification buzzing and tap-to-open RingerScreen!",
      [{ text: "OK" }]
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Manage Alarms</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.testHeaderBtn} onPress={handleTestNotification}>
            <Text style={styles.testHeaderBtnText}>⚡ Test 5s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, item.is_active && cardActiveGlow]}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.time}>{item.alarm_time}</Text>
              <Text style={styles.subText}>{item.challenge_category.toUpperCase()} • {item.days_of_week}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteAlarm(item.id)}>
                <Text style={styles.deleteBtnText}>Del</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.testBtn} onPress={() => startAlarmSession(item)}>
                <Text style={styles.testBtnText}>Test Ring</Text>
              </TouchableOpacity>
              
              <Switch
                value={item.is_active}
                onValueChange={() => toggleSwitch(item.id)}
                trackColor={{ false: colors.outlineVariant, true: colors.primary }}
                thumbColor={item.is_active ? colors.onPrimary : colors.onSurfaceVariant}
              />
            </View>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingAlarmId ? "Edit Alarm" : "Add New Alarm"}</Text>

            <Text style={styles.label}>Alarm Name</Text>
            <TextInput 
              style={styles.input} 
              value={newTitle} 
              onChangeText={setNewTitle} 
              placeholder="e.g. Morning Workout" 
            />
            
            <Text style={styles.label}>Alarm Time</Text>
            <View style={styles.timePickerRow}>
              <View style={styles.timePickerCol}>
                <Text style={styles.timePickerSublabel}>Hour</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newTime.split(":")[0] || "07"}
                    onValueChange={(h) => {
                      const mins = newTime.split(":")[1] || "00";
                      setNewTime(`${h}:${mins}`);
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                      <Picker.Item key={h} label={h} value={h} />
                    ))}
                  </Picker>
                </View>
              </View>
              <Text style={styles.timePickerSeparator}>:</Text>
              <View style={styles.timePickerCol}>
                <Text style={styles.timePickerSublabel}>Minute</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newTime.split(":")[1] || "00"}
                    onValueChange={(m) => {
                      const hrs = newTime.split(":")[0] || "07";
                      setNewTime(`${hrs}:${m}`);
                    }}
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                      <Picker.Item key={m} label={m} value={m} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            
            <Text style={styles.label}>Days of Week</Text>
            <View style={styles.daysRow}>
              {DAYS_OPTIONS.map((day, index) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.dayBubble, isSelected && styles.dayBubbleSelected]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Challenge Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newCategory}
                onValueChange={(itemValue) => setNewCategory(itemValue)}
              >
                <Picker.Item label="Math Problems" value="math" />
                <Picker.Item label="Logic Puzzles" value="logic" />
                <Picker.Item label="Memory Challenges" value="memory" />
                <Picker.Item label="Word Games" value="word" />
                <Picker.Item label="Pattern Recognition" value="pattern" />
                <Picker.Item label="Riddles" value="riddles" />
                <Picker.Item label="Quick Quizzes" value="trivia" />
              </Picker>
            </View>

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#dc3545" />
              <Button title="Save" onPress={handleSaveAlarm} />
            </View>
          </View>
        </View>
      </Modal>
      <RingerScreen
        visible={ringerVisible}
        sessionData={sessionData}
        onDismissSuccess={() => {
          setRingerVisible(false);
          setSessionData(null);
        }}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  testHeaderBtn: {
    backgroundColor: colors.amberAccent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginRight: 8,
  },
  testHeaderBtnText: {
    color: colors.inverseOnSurface,
    fontWeight: "bold",
    fontSize: 13,
  },
  addButton: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  addButtonText: {
    color: colors.onPrimary,
    fontWeight: "bold",
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
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editBtn: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.sm,
  },
  editBtnText: {
    color: colors.onSurface,
    fontWeight: "600",
    fontSize: 14,
  },
  testBtn: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.tertiaryContainer,
    borderRadius: radius.sm,
  },
  testBtnText: {
    color: colors.onTertiaryContainer,
    fontWeight: "600",
    fontSize: 14,
  },
  deleteBtn: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.sm,
  },
  deleteBtnText: {
    color: colors.onErrorContainer,
    fontWeight: "600",
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surfaceContainer,
    padding: 22,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.onSurface,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
    marginBottom: 6,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 12,
    borderRadius: radius.sm,
    fontSize: 16,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayBubble: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  dayBubbleSelected: {
    backgroundColor: colors.primaryContainer,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.onSurfaceVariant,
  },
  dayTextSelected: {
    color: colors.onPrimary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerLow,
    overflow: "hidden",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  timePickerCol: {
    flex: 1,
  },
  timePickerSublabel: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 2,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerLow,
    overflow: "hidden",
  },
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 8,
    marginTop: 14,
    color: colors.onSurface,
  },
});
}