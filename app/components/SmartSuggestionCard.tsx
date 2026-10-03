import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RecurringPattern } from "../utils/patternDetection";
import { DEEP_LINKS, openDeepLink } from "../utils/deepLinks";
import DATA from "../constants/expenseData";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function SmartSuggestionCard({
  pattern,
  onLogNow,
  onDismiss,
}: {
  pattern: RecurringPattern;
  onLogNow: () => void;
  onDismiss: () => void;
}) {
  const label =
    DATA.find((d) => d.category === pattern.category)?.name ?? pattern.category;
  const options = DEEP_LINKS[pattern.category] ?? [];
  const dayName = WEEKDAY_NAMES[pattern.weekday];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.badge}>✦ LAKSH NOTICED A PATTERN</Text>
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close" size={16} color="#8A8B91" />
        </TouchableOpacity>
      </View>

      <Text style={styles.message}>
        You've spent on {label} most {dayName}s for the last{" "}
        {pattern.occurrences} weeks — around ₹{Math.round(pattern.avgAmount)}{" "}
        each time.
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={onLogNow}>
          <Text style={styles.primaryText}>Log it</Text>
        </TouchableOpacity>

        {options.map((opt) => (
          <TouchableOpacity
            key={opt.name}
            style={styles.secondaryButton}
            onPress={() => openDeepLink(opt)}
          >
            <Text style={styles.secondaryText}>Open {opt.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#E8A045",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  primaryText: {
    color: "black",
    fontWeight: "700",
    fontSize: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#524437",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryText: {
    color: "#E2E2E9",
    fontSize: 12,
    fontWeight: "600",
  },
});
