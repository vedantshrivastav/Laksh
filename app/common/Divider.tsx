import { View, Text, StyleSheet } from "react-native";
import React from "react";

const Divider = () => {
  return <View style={styles.divider} />;
};
const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#FFBE71",
    marginHorizontal: 16,
  },
});
export default Divider;
