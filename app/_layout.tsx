import { AuthProvider } from "@/libs/authContext";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <SafeAreaProvider>
          {/* <PaperProvider> */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          {/* </PaperProvider> */}
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
