import "react-native-gesture-handler";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import RootNavigator from "./src/navigation/RootNavigator";
import GlobalAlarmManager from "./src/components/GlobalAlarmManager";

export default function App() {
  return (
    <GlobalAlarmManager>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GlobalAlarmManager>
  );
}