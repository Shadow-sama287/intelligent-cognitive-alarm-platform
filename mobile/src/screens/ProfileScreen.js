import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, SafeAreaView,
  TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mobileApi } from "../services/api";
import { useTheme, spacing, radius } from "../theme";

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

const DIFFICULTY_LABELS = {
  beginner: { label: "Beginner 🌱", color: "#87a878" },
  easy:     { label: "Easy ✅", color: "#87a878" },
  medium:   { label: "Medium ⚡", color: "#f59e0b" },
  hard:     { label: "Hard 🔥", color: "#fb7185" },
  expert:   { label: "Expert 💀", color: "#ffb4ab" },
};

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const s = makeStyles(colors);

  const [profile, setProfile] = useState({
    preferred_wake_time: "07:00",
    target_sleep_hours: "8",
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    difficulty_preference: "medium",
    productivity_goals: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      Alert.alert("✅ Saved", "Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("user_token");
            const parent = navigation?.getParent ? navigation.getParent() : null;
            if (parent) {
              parent.reset({ index: 0, routes: [{ name: "Login" }] });
            } else if (navigation?.reset) {
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            }
          } catch (err) {
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const diffInfo = DIFFICULTY_LABELS[profile.difficulty_preference] || DIFFICULTY_LABELS.medium;

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>

          {/* ── Hero Header ───────────────────────────────────── */}
          <View style={s.heroCard}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarEmoji}>🧠</Text>
            </View>
            <Text style={s.heroTitle}>Your Profile</Text>
            <Text style={s.heroSub}>Cognitive Alarm Preferences</Text>
          </View>

          {/* ── Appearance Section ────────────────────────────── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>APPEARANCE</Text>
            <View style={s.settingRow}>
              <View style={s.settingRowLeft}>
                <Text style={s.settingIcon}>{isDark ? "🌙" : "☀️"}</Text>
                <View>
                  <Text style={s.settingTitle}>{isDark ? "Dark Mode" : "Light Mode"}</Text>
                  <Text style={s.settingDesc}>{isDark ? "Lumina Mind dark theme" : "Lumina Analytics light theme"}</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                thumbColor={isDark ? colors.onPrimary : colors.outline}
              />
            </View>
          </View>

          {/* ── Wake-Up Preferences ───────────────────────────── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>WAKE-UP PREFERENCES</Text>

            <View style={s.formGroup}>
              <Text style={s.label}>⏰ Preferred Wake-up Time</Text>
              <TextInput
                style={s.input}
                value={profile.preferred_wake_time}
                onChangeText={(val) => handleChange("preferred_wake_time", val)}
                placeholder="07:00"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            <View style={s.formGroup}>
              <Text style={s.label}>😴 Target Sleep Hours</Text>
              <TextInput
                style={s.input}
                value={profile.target_sleep_hours}
                onChangeText={(val) => handleChange("target_sleep_hours", val)}
                keyboardType="numeric"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>
          </View>

          {/* ── Challenge Settings ────────────────────────────── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>CHALLENGE SETTINGS</Text>

            {/* Difficulty pill preview */}
            <View style={[s.difficultyBadge, { borderColor: diffInfo.color }]}>
              <Text style={[s.difficultyBadgeText, { color: diffInfo.color }]}>
                Current: {diffInfo.label}
              </Text>
            </View>

            <View style={s.formGroup}>
              <Text style={s.label}>🎯 Default Difficulty</Text>
              <View style={s.pickerContainer}>
                <Picker
                  selectedValue={profile.difficulty_preference}
                  onValueChange={(val) => handleChange("difficulty_preference", val)}
                  dropdownIconColor={colors.onSurface}
                >
                  <Picker.Item label="🌱 Beginner" value="beginner" />
                  <Picker.Item label="✅ Easy" value="easy" />
                  <Picker.Item label="⚡ Medium" value="medium" />
                  <Picker.Item label="🔥 Hard" value="hard" />
                  <Picker.Item label="💀 Expert" value="expert" />
                </Picker>
              </View>
            </View>

            <View style={s.formGroup}>
              <Text style={s.label}>💬 Productivity Goals</Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={profile.productivity_goals}
                onChangeText={(val) => handleChange("productivity_goals", val)}
                placeholder="e.g. Wake up by 6am, solve 2 challenges daily"
                placeholderTextColor={colors.onSurfaceVariant}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* ── Location / Time Zone ─────────────────────────── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>REGION</Text>
            <View style={s.formGroup}>
              <Text style={s.label}>🌍 Time Zone</Text>
              <View style={s.pickerContainer}>
                <Picker
                  selectedValue={profile.time_zone}
                  onValueChange={(val) => handleChange("time_zone", val)}
                  dropdownIconColor={colors.onSurface}
                >
                  {TIMEZONES.map((tz) => (
                    <Picker.Item key={tz} label={tz.replace(/_/g, " ")} value={tz} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* ── Actions ──────────────────────────────────────── */}
          <TouchableOpacity
            style={[s.saveButton, saving && s.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={s.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
            <Text style={s.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: colors.background },
    centered:         { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText:      { color: colors.onSurfaceVariant, fontSize: 14, marginTop: 8 },
    scrollContainer:  { padding: spacing.md, paddingBottom: 40 },

    // Hero
    heroCard: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      marginBottom: spacing.md,
    },
    avatarCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceContainerHigh,
      borderWidth: 2,
      borderColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
      shadowColor: colors.primaryContainer,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    avatarEmoji:  { fontSize: 36 },
    heroTitle:    { fontSize: 24, fontWeight: "700", color: colors.onSurface, marginBottom: 4 },
    heroSub:      { fontSize: 13, color: colors.onSurfaceVariant, letterSpacing: 0.5 },

    // Section
    section: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.onSurfaceVariant,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: spacing.sm,
    },

    // Setting row (for toggle)
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    settingRowLeft:   { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    settingIcon:      { fontSize: 22 },
    settingTitle:     { fontSize: 15, fontWeight: "600", color: colors.onSurface },
    settingDesc:      { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },

    // Difficulty badge
    difficultyBadge: {
      alignSelf: "flex-start",
      borderWidth: 1.5,
      borderRadius: radius.full,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginBottom: spacing.sm,
    },
    difficultyBadgeText: { fontSize: 13, fontWeight: "700" },

    // Form
    formGroup:    { marginBottom: spacing.sm },
    label:        { fontSize: 13, fontWeight: "600", color: colors.onSurfaceVariant, marginBottom: 6 },
    input:        {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainer,
    },
    textArea:     { minHeight: 80, textAlignVertical: "top" },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceContainer,
      overflow: "hidden",
    },

    // Buttons
    saveButton: {
      backgroundColor: colors.primaryContainer,
      paddingVertical: 16,
      borderRadius: radius.md,
      alignItems: "center",
      marginBottom: spacing.sm,
      shadowColor: colors.primaryContainer,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText:     { color: colors.onPrimary, fontSize: 16, fontWeight: "700" },
    logoutButton: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: colors.error,
      paddingVertical: 14,
      borderRadius: radius.md,
      alignItems: "center",
      marginBottom: 20,
    },
    logoutButtonText: { color: colors.error, fontSize: 16, fontWeight: "700" },
  });
}