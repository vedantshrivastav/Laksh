import { Tabs } from "expo-router";
import Header from "../common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity, View } from "react-native";
import ExpenseSheet from "../components/ExpenseSheet";
import { useState } from "react";

export default function TabLayout() {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1C1F26",
            borderTopColor: "#E8A045",
          },
          tabBarActiveTintColor: "#E8A045",
          tabBarInactiveTintColor: "#D6C3B1",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={24} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={String(color)}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="bar-chart"
                size={24}
                color={String(color ?? "#000")}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: "Rewards",
            tabBarIcon: ({ color }) => (
              <Ionicons name="gift" size={24} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={String(color)} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
