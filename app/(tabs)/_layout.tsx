import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1C1F26",
          borderTopColor: "#2A2D35",
        },
        tabBarActiveTintColor: "#E8A045",
        tabBarInactiveTintColor: "#555",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="goals" options={{ title: "Goals" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards" }} />
    </Tabs>
  );
}
