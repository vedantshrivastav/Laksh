import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import DATA from "../constants/expenseData";
import { Category } from "../storage/useExpenseStore";
type Props = { selected: Category; onSelect: (c: Category) => void };
const ExpenseItem = ({ selected, onSelect }: Props) => (
  <>
    {DATA.map((item) => {
      const active = item.category === selected;
      return (
        <TouchableOpacity
          key={item.id}
          onPress={() => onSelect(item.category)}
          style={[styles.ExpenseCard, active && styles.activeCard]}
        >
          {item.Icon}
          <Text style={[styles.text, { textAlign: "center" }]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    })}
  </>
);
const styles = StyleSheet.create({
  ExpenseCard: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
  },
  activeCard: { borderColor: "#E8A045", backgroundColor: "#2A2418" },
  text: {
    color: "white",
  },
});
export default ExpenseItem;
