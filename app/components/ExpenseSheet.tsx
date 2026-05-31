import { Modal, View, Text, StyleSheet, TextInput } from "react-native";
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

export default function ExpenseSheet({ visible }: { visible: boolean }) {
  const [value, setValue] = useState("");
  const [amount, setAmount] = useState("");
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "50%",
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
            <Ionicons name="close-outline" size={24} color="white" />
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
        <View>
          <Text>Category</Text>
        </View>
        {/* Note and date */}
        <View>
          <Text>Label</Text>
          <Text></Text>
        </View>
        {/* Save button */}
        <View></View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
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
    textAlign: "center",
  },
});
