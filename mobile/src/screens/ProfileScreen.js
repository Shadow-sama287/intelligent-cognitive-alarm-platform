import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, SafeAreaView,
  TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { mobileApi } from "../services/api";

// Full curated IANA timezone list for the dropdown
const TIMEZONES = [
  "UTC",
  "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers",
  "Africa/Cairo", "Africa/Casablanca", "Africa/Johannesburg", "Africa/Lagos",
  "Africa/Nairobi", "Africa/Tunis",
  "America/Anchorage", "America/Argentina/Buenos_Aires", "America/Bogota",
  "America/Caracas", "America/Chicago", "America/Denver", "America/Halifax",
  "America/Lima", "America/Los_Angeles", "America/Mexico_City",
  "America/New_York", "America/Phoenix", "America/Santiago",
  "America/Sao_Paulo", "America/St_Johns", "America/Toronto",
  "America/Vancouver",
  "Asia/Almaty", "Asia/Baghdad", "Asia/Baku", "Asia/Bangkok",
  "Asia/Colombo", "Asia/Dhaka", "Asia/Dubai", "Asia/Ho_Chi_Minh",
  "Asia/Hong_Kong", "Asia/Jakarta", "Asia/Kabul", "Asia/Karachi",
  "Asia/Kathmandu", "Asia/Kolkata", "Asia/Kuala_Lumpur", "Asia/Kuwait",
  "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Riyadh",
  "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Taipei",
  "Asia/Tashkent", "Asia/Tehran", "Asia/Tokyo", "Asia/Yangon",
  "Asia/Yerevan",
  "Atlantic/Azores", "Atlantic/Cape_Verde", "Atlantic/Reykjavik",
  "Australia/Adelaide", "Australia/Brisbane", "Australia/Darwin",
  "Australia/Hobart", "Australia/Perth", "Australia/Sydney",
  "Europe/Amsterdam", "Europe/Athens", "Europe/Belgrade", "Europe/Berlin",
  "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest",
  "Europe/Copenhagen", "Europe/Dublin", "Europe/Helsinki",
  "Europe/Istanbul", "Europe/Kiev", "Europe/Lisbon", "Europe/London",
  "Europe/Luxembourg", "Europe/Madrid", "Europe/Moscow", "Europe/Oslo",
  "Europe/Paris", "Europe/Prague", "Europe/Rome", "Europe/Sofia",
  "Europe/Stockholm", "Europe/Vienna", "Europe/Warsaw", "Europe/Zurich",
  "Indian/Maldives", "Indian/Mauritius",
  "Pacific/Auckland", "Pacific/Fiji", "Pacific/Guam", "Pacific/Honolulu",
  "Pacific/Midway", "Pacific/Noumea", "Pacific/Pago_Pago", "Pacific/Port_Moresby",
  "Pacific/Tahiti", "Pacific/Tongatapu",
];


export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    preferred_wake_time: "07:00",
    target_sleep_hours: "8",
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    difficulty_preference: "medium",
    productivity_goals: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current profile from backend on mount to pre-populate the form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await mobileApi.get("/profile");
        const data = res.data.data;
        setProfile({
          preferred_wake_time: data.preferred_wake_time ?? "07:00",
          target_sleep_hours: String(data.target_sleep_hours ?? "8"),
          time_zone: data.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          difficulty_preference: data.difficulty_preference ?? "medium",
          productivity_goals: data.productivity_goals ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        Alert.alert("Warning", "Could not load profile. Showing defaults.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...profile,
        target_sleep_hours: parseFloat(profile.target_sleep_hours) || 8,
      };
      await mobileApi.put("/profile", payload);
      Alert.alert("Success", "Profile saved successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile Settings</Text>
            <Text style={styles.subtitle}>Manage your wake-up preferences.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Wake-up Time</Text>
            <TextInput
              style={styles.input}
              value={profile.preferred_wake_time}
              onChangeText={(val) => handleChange("preferred_wake_time", val)}
              placeholder="07:00"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Target Sleep Hours</Text>
            <TextInput
              style={styles.input}
              value={profile.target_sleep_hours}
              onChangeText={(val) => handleChange("target_sleep_hours", val)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Time Zone</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profile.time_zone}
                onValueChange={(val) => handleChange("time_zone", val)}
              >
                {TIMEZONES.map((tz) => (
                  <Picker.Item
                    key={tz}
                    label={tz.replace(/_/g, " ")}
                    value={tz}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Default Difficulty</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profile.difficulty_preference}
                onValueChange={(val) => handleChange("difficulty_preference", val)}
              >
                <Picker.Item label="Beginner" value="beginner" />
                <Picker.Item label="Easy" value="easy" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="Hard" value="hard" />
                <Picker.Item label="Expert" value="expert" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Productivity Goals</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.productivity_goals}
              onChangeText={(val) => handleChange("productivity_goals", val)}
              placeholder="e.g. Wake up by 6am, solve 2 challenges daily"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  saveButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});