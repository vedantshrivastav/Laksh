import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

export default function Header() {
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
        <Ionicons name="notifications" size={24} color={colors.textSecondary} />
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
});
