import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

import { alarms } from "../data/alarms";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        My Alarms
      </Text>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.time}>
              {item.time}
            </Text>

            <Text>{item.label}</Text>

            <Text>
              {item.enabled ? "Enabled" : "Disabled"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    padding: 18,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },

  time: {
    fontSize: 22,
    fontWeight: "bold",
  },
});