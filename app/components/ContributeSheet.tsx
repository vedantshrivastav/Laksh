import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { colors, fontFamily, radius } from "../constants/theme";
import Divider from "../common/Divider";
import { useGoalStore } from "../storage/useGoalStore";
import type { Goal } from "../storage/useGoalStore";

const QUICK_AMOUNTS = [100, 500, 1000];

export default function ContributeSheet({
  goal,
  onClose,
}: {
  goal: Goal | null;
  onClose: () => void;
}) {
  const contribute = useGoalStore((s) => s.contributeToGoal);

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const remaining = goal
    ? Math.max(goal.targetAmount - goal.savedAmount, 0)
    : 0;

  // Start fresh every time a goal is selected
  useEffect(() => {
    if (goal) {
      setAmount("");
      setError("");
    }
  }, [goal?.id]);

  const handleSave = () => {
    if (!goal) return;
    const amt = parseFloat(amount);

    if (!amt || amt <= 0) return setError("Enter a valid amount");
    if (remaining <= 0) return setError("This goal is already complete");

    // The store also caps at the target, this just keeps the UI honest
    contribute(goal.id, Math.min(amt, remaining));

    setAmount("");
    setError("");
    onClose();
  };

  return (
    <Modal visible={!!goal} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Add to {goal?.emoji} {goal?.name}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.amountRow}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            maxLength={9}
            autoFocus
          />
        </View>

        <Text style={styles.remaining}>
          ₹{remaining.toLocaleString("en-IN")} left to reach your goal
        </Text>

        <Divider />

        {/* Quick amounts */}
        <View style={styles.chipRow}>
          {QUICK_AMOUNTS.map((q) => (
            <TouchableOpacity
              key={q}
              style={styles.chip}
              onPress={() => setAmount(String(q))}
            >
              <Text style={styles.chipText}>+₹{q}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.chip}
            onPress={() => setAmount(String(remaining))}
          >
            <Text style={styles.chipText}>Remaining</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Add Money</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  currency: {
    fontSize: 36,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 56,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    minWidth: 60,
    textAlign: "left",
  },
  remaining: {
    color: "#D6C3B1",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
  },
  chipText: {
    color: "white",
    fontSize: 13,
  },
  error: {
    color: "#EF4444",
    marginHorizontal: 20,
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: "#E8A045",
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
  },
  saveText: {
    fontWeight: "700",
  },
});
