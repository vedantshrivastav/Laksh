import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";
import { useRouter } from "expo-router";
import { useNotificationStore } from "../storage/useNotificationStore";

export default function Header() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={styles.leftSection}>
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 32, height: 32, borderRadius: 20 }}
          />
          <Text style={styles.title}>Laksh</Text>
        </View>
        {/* <Ionicons name="notifications" size={24} color={colors.textSecondary} /> */}
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          style={styles.bellWrap}
        >
          <Ionicons
            name="notifications"
            size={24}
            color={colors.textSecondary}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  main: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "700",
  },
  divider: {
    height: 0.2,
    backgroundColor: "#FFBE71",
  },
  bellWrap: {
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E8A045",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "black",
    fontSize: 10,
    fontWeight: "700",
  },
});
