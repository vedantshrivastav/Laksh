import { View, Text, StyleSheet } from "react-native";
import React from "react";

const Divider = () => {
  return <View style={styles.divider} />;
};
const styles = StyleSheet.create({
  divider: {
    height: 0.4,
    backgroundColor: "#FFBE71",
    marginHorizontal: 16,
  },
});
export default Divider;
