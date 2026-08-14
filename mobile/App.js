import "react-native-gesture-handler";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import RootNavigator from "./src/navigation/RootNavigator";
import GlobalAlarmManager from "./src/components/GlobalAlarmManager";
import { ThemeProvider } from "./src/theme";

export default function App() {
  return (
    <ThemeProvider>
      <GlobalAlarmManager>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </GlobalAlarmManager>
    </ThemeProvider>
  );
}