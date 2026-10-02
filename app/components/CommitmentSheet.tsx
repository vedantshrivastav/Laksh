import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { colors, fontFamily, radius } from "../constants/theme";
import Divider from "../common/Divider";
import DATA from "../constants/expenseData";
import type { Category } from "../storage/useExpenseStore";
import { useCommitmentStore } from "../storage/useCommitmentStore";

export default function CommitmentSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const commitments = useCommitmentStore((s) => s.commitments);
  const addCommitment = useCommitmentStore((s) => s.addCommitment);
  const deleteCommitment = useCommitmentStore((s) => s.deleteCommitment);

  const [category, setCategory] = useState<Category>("food");
  const [maxCount, setMaxCount] = useState("3");
  const [period, setPeriod] = useState<"day" | "week">("week");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const n = parseInt(maxCount, 10);
    if (!n || n <= 0) return setError("Enter a valid number");

    addCommitment({ category, maxCount: n, period });
    setMaxCount("3");
    setError("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Rules</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Existing rules */}
          {commitments.length === 0 ? (
            <Text style={styles.emptyText}>No rules yet. Add one below.</Text>
          ) : (
            commitments.map((c) => {
              const label =
                DATA.find((d) => d.category === c.category)?.name ?? c.category;
              return (
                <View key={c.id} style={styles.ruleRow}>
                  <Text style={styles.ruleText}>
                    Max {c.maxCount}x {label} per {c.period}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Remove rule?", label, [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Remove",
                          style: "destructive",
                          onPress: () => deleteCommitment(c.id),
                        },
                      ])
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          <Divider />

          {/* New rule form */}
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.chipRow}>
            {DATA.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.chip,
                  category === d.category && styles.chipActive,
                ]}
                onPress={() => setCategory(d.category)}
              >
                <Text style={styles.chipText}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>MAX TIMES</Text>
          <TextInput
            style={styles.textInput}
            value={maxCount}
            onChangeText={(t) => setMaxCount(t.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            placeholder="3"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>PER</Text>
          <View style={styles.chipRow}>
            {(["day", "week"] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, period === p && styles.chipActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={styles.chipText}>
                  {p === "day" ? "Day" : "Week"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
            <Text style={styles.saveText}>Add Rule</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "85%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: { flexDirection: "row", justifyContent: "space-between", margin: 20 },
  title: { color: "white", fontSize: 18, fontWeight: "bold" },
  emptyText: { color: "#D6C3B1", marginHorizontal: 20, marginBottom: 10 },
  ruleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
    borderRadius: radius.sm,
    padding: 12,
  },
  ruleText: { color: "white", fontSize: 13, flex: 1 },
  label: {
    color: "#D6C3B1",
    fontSize: 12,
    marginHorizontal: 20,
    marginTop: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
  },
  chipActive: { borderColor: "#E8A045", backgroundColor: "#2A2418" },
  chipText: { color: "white", fontSize: 13 },
  textInput: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#524437",
    borderRadius: radius.sm,
    padding: 12,
  },
  error: { color: "#EF4444", marginHorizontal: 20, marginTop: 10 },
  saveButton: {
    backgroundColor: "#E8A045",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
  },
  saveText: { fontWeight: "700" },
});
