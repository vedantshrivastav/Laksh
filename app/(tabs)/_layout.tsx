import { Tabs } from "expo-router";
import Header from "../common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity, View } from "react-native";

export default function TabLayout() {
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
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ color }) => (
              <Ionicons name="checkmark-circle" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color }) => (
              <Ionicons name="bar-chart" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: "Rewards",
            tabBarIcon: ({ color }) => (
              <Ionicons name="gift" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 21,
          alignSelf: "center",
          width: 40,
          height: 40,
          borderRadius: 30,
          backgroundColor: "#F5B65A",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="add" size={18} color="black" />
      </TouchableOpacity>
    </View>
  );
}
