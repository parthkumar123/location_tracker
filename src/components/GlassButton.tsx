import React, { ReactNode } from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { colors, theme } from "../theme";

interface GlassButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
  disabled?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onPress,
  variant = "primary",
  style,
  disabled = false,
}) => {
  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{
            type: "timing",
            duration: 150,
          }}
          style={[styles.button, style]}
        >
          <LinearGradient
            colors={colors.gradientCyanPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, disabled && styles.disabled]}
          >
            {children}
          </LinearGradient>
        </MotiView>
      </TouchableOpacity>
    );
  }

  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{
            type: "timing",
            duration: 150,
          }}
          style={[styles.button, styles.outlineButton, style]}
        >
          {children}
        </MotiView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{
          type: "timing",
          duration: 150,
        }}
        style={[styles.button, styles.secondaryButton, style]}
      >
        {children}
      </MotiView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    ...theme.shadows.glow.cyan,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassLight,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.cyan,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
