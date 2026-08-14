import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mobileApi } from "../services/api";
import { colors, spacing, radius } from "../theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const requestBody = `username=${encodeURIComponent(email.trim())}&password=${encodeURIComponent(password)}`;

      const response = await mobileApi.post("/auth/login", requestBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = response.data.access_token;
      await AsyncStorage.setItem("user_token", token);
      
      navigation.replace("Main");
    } catch (error) {
      const targetUrl = (error.config?.baseURL || '') + (error.config?.url || '/auth/login');
      const errorMsg = error.response?.data?.detail 
        || error.message 
        || "Network / Credentials error";

      console.error(`[Login Failed] Target: ${targetUrl}`, error);
      Alert.alert(
        "Login Failed",
        `Target URL:\n${targetUrl}\n\nDetails:\n${errorMsg}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Intelligent Cognitive Alarm</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.onSurfaceVariant}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.onSurfaceVariant}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={login} color={colors.primaryContainer} />
      <View style={styles.spacer} />
      <Button title="Create Account" onPress={() => navigation.navigate("Register")} color={colors.onSurfaceVariant} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.lg,
    textAlign: "center",
    color: colors.onSurface,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 12,
    marginBottom: 15,
    borderRadius: radius.sm,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
  },
  spacer: {
    height: 10,
  },
});