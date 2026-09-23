import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import {
  colors,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Divider from "../common/Divider";
import ExpenseItem from "./ExpenseItem";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Category, useExpenseStore } from "../storage/useExpenseStore";
import DATA from "../constants/expenseData";

export default function ExpenseSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");
  const handleSave = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError("Enter a valid amount");
      return;
    }
    addExpense({
      amount: num,
      category,
      label: DATA.find((d) => d.category === category)?.name ?? "Other",
      note: note.trim(),
      date: date.toISOString(),
    });
    setAmount("");
    setNote("");
    setError("");
    setDate(new Date());
    setCategory("food");
    onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}></Pressable>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "85%",
          backgroundColor: colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        {/*Add amount  */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              margin: 20,
            }}
          >
            <Text style={styles.AddExpense}>Add Expense</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {/*  */}
          <View style={styles.container}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={7}
              autoFocus
            />
          </View>
        </View>
        <Divider />
        {/* Category */}
        <View style={{ marginTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
              // backgroundColor: "blue",
            }}
          >
            <Text style={styles.label}>CATEGORY</Text>
            <Text style={[styles.seeAllText]}>See All</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 10,
              marginHorizontal: 20,
            }}
          >
            <ExpenseItem selected={category} onSelect={setCategory} />
          </View>
        </View>
        {/* Note and date */}
        <View style={{}}>
          <View style={{ marginTop: 6 }}>
            <Text style={[styles.label]}>NOTE</Text>
            <TextInput
              style={styles.noteAnddateInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add Details"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={{}}>
            <Text style={styles.label}>DATE</Text>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="calendar-outline" size={18} color="white" />
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);

                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )}
          </View>
        </View>
        {error ? (
          <Text style={{ color: "#EF4444", marginHorizontal: 20 }}>
            {error}
          </Text>
        ) : null}
        {/* Save button */}
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text>Save Transaction</Text>
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
  AddExpense: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
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
  input: {
    fontSize: 56,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    minWidth: 60,
    textAlign: "left",
  },
  noteAnddateInput: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    minWidth: 60,
    textAlign: "center",
    // backgroundColor: "red",
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#524437",
  },
  dateInput: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#524437",
    borderRadius: radius.sm,
    padding: 12,
  },

  dateText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: fontFamily.bold,
  },
  label: {
    color: "#D6C3B1",
    fontSize: 12,
    marginHorizontal: 20,
    marginTop: 4,
  },
  seeAllText: {
    color: "#D6C3B1",
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 60,
    // backgroundColor: "red",
  },
  saveButton: {
    backgroundColor: "#E8A045",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
  },
});
