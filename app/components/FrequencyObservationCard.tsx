import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { FrequencyObservation } from "../utils/weeklyFrequency";
import DATA from "../constants/expenseData";

export default function FrequencyObservationCard({
  observation,
  onDismiss,
}: {
  observation: FrequencyObservation;
  onDismiss: () => void;
}) {
  const label =
    DATA.find((d) => d.category === observation.category)?.name ??
    observation.category;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.badge}>✦ LAKSH NOTICED</Text>
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close" size={16} color="#8A8B91" />
        </TouchableOpacity>
      </View>

      <Text style={styles.message}>
        You've logged {label} {observation.count} times this week — ₹
        {Math.round(observation.total).toLocaleString("en-IN")} total.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
    borderRadius: 12,
    marginHorizontal: 18,
    marginVertical: 6,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    color: "#E8A045",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  message: {
    color: "#E2E2E9",
    fontSize: 13,
    lineHeight: 19,
  },
});
