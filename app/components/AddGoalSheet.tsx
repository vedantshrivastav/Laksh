import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, fontFamily, radius } from "../constants/theme";
import Divider from "../common/Divider";
import { useGoalStore } from "../storage/useGoalStore";

const EMOJIS = ["🎯", "💻", "🏠", "✈️", "🛡️", "📱"];

const defaultDate = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

export default function AddGoalSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const addGoal = useGoalStore((s) => s.addGoal);

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [target, setTarget] = useState("");
  const [date, setDate] = useState(defaultDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setEmoji(EMOJIS[0]);
    setTarget("");
    setDate(defaultDate());
    setShowDatePicker(false);
    setError("");
  };

  // Start fresh every time the sheet opens
  useEffect(() => {
    if (visible) reset();
  }, [visible]);

  const handleSave = () => {
    const amt = parseFloat(target);

    // Treat the chosen day as ending at 23:59:59 so "today" is still valid
    const targetDate = new Date(date);
    targetDate.setHours(23, 59, 59, 999);

    if (!name.trim()) return setError("Enter a goal name");
    if (!amt || amt <= 0) return setError("Enter a valid target amount");
    if (targetDate.getTime() <= Date.now())
      return setError("Pick a future date");

    addGoal({
      name: name.trim(),
      emoji,
      targetAmount: amt,
      startDate: new Date().toISOString(),
      targetDate: targetDate.toISOString(),
    });

    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>New Goal</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Target amount */}
          <View style={styles.amountRow}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={target}
              onChangeText={(t) => setTarget(t.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              maxLength={9}
            />
          </View>
          <Divider />

          {/* Name */}
          <Text style={styles.label}>GOAL NAME</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. MacBook Pro"
            placeholderTextColor={colors.textMuted}
            maxLength={30}
          />

          {/* Emoji */}
          <Text style={styles.label}>ICON</Text>
          <View style={styles.emojiRow}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => setEmoji(e)}
                style={[
                  styles.emojiChip,
                  emoji === e && styles.emojiChipActive,
                ]}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Target date */}
          <Text style={styles.label}>TARGET DATE</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={18} color="white" />
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(_event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {/* Error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Save */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Create Goal</Text>
          </TouchableOpacity>
        </ScrollView>
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
    height: "85%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  label: {
    color: "#D6C3B1",
    fontSize: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  textInput: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#524437",
    borderRadius: radius.sm,
    padding: 12,
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  emojiChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
  },
  emojiChipActive: {
    borderColor: "#E8A045",
    backgroundColor: "#2A2418",
  },
  dateInput: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#524437",
    borderRadius: radius.sm,
    padding: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: fontFamily.bold,
  },
  error: {
    color: "#EF4444",
    marginHorizontal: 20,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#E8A045",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
  },
  saveText: {
    fontWeight: "700",
  },
});
