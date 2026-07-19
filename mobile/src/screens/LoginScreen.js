import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mobileApi } from "../services/api";

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
      const errorMessage = error.response?.data?.detail 
        || error.message 
        || "Invalid credentials";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Intelligent Cognitive Alarm</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={login} />
      <View style={styles.spacer} />
      <Button title="Create Account" onPress={() => navigation.navigate("Register")} type="clear" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  spacer: {
    height: 10,
  },
});