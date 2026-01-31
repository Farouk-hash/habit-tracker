import { useAuth } from "@/libs/authContext";
import { AntDesign } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        // Tab bar styles
        tabBarStyle: {
          backgroundColor: "#0F0F0F",
          borderTopColor: "#333333",
          borderTopWidth: 1,
          height: Platform.OS === "android" ? 100 : 60,
          paddingBottom: Platform.OS === "android" ? 10 : 8, // More padding on Android
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#FF4444",
        tabBarInactiveTintColor: "#888888",
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 2,
        },

        // Header styles
        headerStyle: {
          backgroundColor: "#0F0F0F",
          borderBottomColor: "#FF4444",
          borderBottomWidth: 2,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tracker",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
          headerTitle: "Tracker",
        }}
      />

      <Tabs.Screen
        name="streacks"
        options={{
          title: "Streacks",
          tabBarIcon: ({ color, size }) => (
            <EvilIcons name="chart" size={size} color={color} />
          ),
          headerTitle: "Streacks",
        }}
      />

      <Tabs.Screen
        name="addHabit"
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="plus-circle" size={size} color={color} />
          ),
          headerTitle: "Add Habit",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Simple styles only if needed
});
