import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AlarmsScreen from "../screens/AlarmsScreen";
import HabitsScreen from "../screens/HabitsScreen";
import { useTheme } from "../theme";

const Tab = createBottomTabNavigator();

const tabIcon = (label) => ({ color }) => (
  <Text style={{ fontSize: 20 }}>
    {label === "Home" ? "🏠" : label === "Alarms" ? "⏰" : label === "Habits" ? "📋" : "👤"}
  </Text>
);

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.outlineVariant + '66',
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
        headerStyle: { backgroundColor: colors.surfaceContainerLow },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarIcon: tabIcon("Home") }} />
      <Tab.Screen name="Alarms"  component={AlarmsScreen}  options={{ tabBarIcon: tabIcon("Alarms") }} />
      <Tab.Screen name="Habits"  component={HabitsScreen}  options={{ tabBarIcon: tabIcon("Habits") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon("Profile") }} />
    </Tab.Navigator>
  );
}