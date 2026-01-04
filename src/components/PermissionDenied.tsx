import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedView } from "./AnimatedView";
import { AlertCircle, Settings } from "lucide-react-native";
import { GlassCard } from "./GlassCard";
import { colors, typography, spacing, theme } from "../theme";
import * as Linking from "expo-linking";

interface PermissionDeniedProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  title,
  message,
  onRetry,
}) => {
  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={StyleSheet.absoluteFillObject}
      />

      <AnimatedView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 600 }}
        style={styles.content}
      >
        <GlassCard style={styles.card}>
          <View style={styles.iconContainer}>
            <AlertCircle size={64} color={colors.warning} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={openSettings}
              style={styles.button}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradientCyanPurple}
                style={styles.buttonGradient}
              >
                <Settings size={20} color={colors.textPrimary} />
                <Text style={styles.buttonText}>Open Settings</Text>
              </LinearGradient>
            </TouchableOpacity>

            {onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                style={[styles.button, styles.secondaryButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>
      </AnimatedView>
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
  content: {
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: spacing.lg,
  },
  card: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.wide,
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: "100%",
    gap: spacing.md,
  },
  button: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: colors.cyan,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
    textAlign: "center",
    paddingVertical: 16,
  },
});
