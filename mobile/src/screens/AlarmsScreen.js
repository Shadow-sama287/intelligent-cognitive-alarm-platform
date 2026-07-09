import React, { useState, useCallback } from "react";
import { 
  View, Text, StyleSheet, FlatList, Switch, SafeAreaView, 
  TouchableOpacity, Modal, TextInput, Button, Alert 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { mobileApi } from "../services/api";
import RingerScreen from "./RingerScreen";

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

  const loadAlarms = async () => {
    try {
      const res = await mobileApi.get("/alarms");
      setAlarms(res.data.data);
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
  const startAlarmSession = async (alarm) => {
  try {
    const response = await mobileApi.post("/sessions/start", null, {
      params: {
        alarm_id: alarm.id,
        category: alarm.challenge_category,
      },
    });

    setSessionData(response.data.data);
    setRingerVisible(true);
  } catch (error) {
    console.error(error.response?.data || error);;

    Alert.alert(
  "Error",
  error.response?.data?.detail ||
    "Could not start alarm session."
);
  }
};
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Manage Alarms</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
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
                trackColor={{ false: "#ccc", true: "#007BFF" }}
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
            
            <Text style={styles.label}>Alarm Time (HH:MM)</Text>
            <TextInput 
              style={styles.input} 
              value={newTime} 
              onChangeText={setNewTime} 
              placeholder="07:00" 
            />
            
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
                <Picker.Item label="Math" value="math" />
                <Picker.Item label="Puzzle" value="puzzle" />
                <Picker.Item label="Typing" value="typing" />
                <Picker.Item label="Memory" value="memory" />
                <Picker.Item label="Shake" value="shake" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  editBtnText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },
  testBtn: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#d4edda",
    borderRadius: 6,
  },
  testBtnText: {
    color: "#155724",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteBtn: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fee",
    borderRadius: 6,
  },
  deleteBtnText: {
    color: "#d9534f",
    fontWeight: "600",
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  dayBubbleSelected: {
    backgroundColor: "#007BFF",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  dayTextSelected: {
    color: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    overflow: "hidden",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});