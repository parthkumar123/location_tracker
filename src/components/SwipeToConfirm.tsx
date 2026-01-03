import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import { colors, theme, typography } from "../theme";

interface SwipeToConfirmProps {
  onConfirm: () => void;
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
}

const BUTTON_WIDTH = Dimensions.get("window").width - 64;
const BUTTON_HEIGHT = 60;

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  onConfirm,
  isActive,
  activeText = "Swipe to Stop",
  inactiveText = "Swipe to Start",
}) => {
  const handlePress = () => {
    onConfirm();

  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.background,
          {
            backgroundColor: isActive
              ? "rgba(239, 68, 68, 0.2)"
              : "rgba(6, 182, 212, 0.2)",
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isActive ? ["#ef4444", "#dc2626"] : colors.gradientCyanPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.text}>
            {isActive ? activeText : inactiveText}
          </Text>
          <ChevronRight size={28} color={colors.textPrimary} strokeWidth={3} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
  },
  background: {
    width: "100%",
    height: "100%",
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.glassLight,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: "uppercase",
  },
});
