import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

export const TestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.textPrimary,
    fontSize: 20,
  },
});

