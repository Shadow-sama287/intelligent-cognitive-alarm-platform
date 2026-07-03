import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {

  const login = async () => {
    const mockToken = "mock-jwt-token-123456";

    await AsyncStorage.setItem("token", mockToken);

    navigation.replace("Main");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Intelligent Cognitive Alarm
      </Text>

      <Button
        title="Mock Login"
        onPress={login}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});