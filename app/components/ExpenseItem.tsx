import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { DATA } from "../(tabs)/index";
const ExpenseItem = () => {
  return DATA.map((item) => (
    <TouchableOpacity style={styles.ExpenseCard} key={item.id}>
      {item.Icon}
      <Text style={[styles.text, { textAlign: "center" }]}>{item.name}</Text>
    </TouchableOpacity>
  ));
};
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
  text: {
    color: "white",
  },
});
export default ExpenseItem;
