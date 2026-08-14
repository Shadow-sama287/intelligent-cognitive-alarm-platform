import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { mobileApi } from "../services/api";
import { colors, spacing, radius } from "../theme";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await mobileApi.post("/auth/register", {
        full_name: fullName,
        email: email.trim(),
        password: password,
      });
      Alert.alert("Success", "Registration successful. Please login.");
      navigation.navigate("Login");
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || error.message 
        || "Registration failed";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={colors.onSurfaceVariant}
        value={fullName}
        onChangeText={setFullName}
      />
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
      <Button title="Register" onPress={register} color={colors.primaryContainer} />
      <View style={styles.spacer} />
      <Button title="Back to Login" onPress={() => navigation.navigate("Login")} color={colors.onSurfaceVariant} />
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

