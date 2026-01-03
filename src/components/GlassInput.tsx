import React, { useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  Text,
} from "react-native";
import { MotiView } from "moti";
import { colors, typography, theme } from "../theme";

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <MotiView
        animate={{
          borderColor: isFocused ? colors.cyan : colors.glassLight,
        }}
        transition={{
          type: "timing",
          duration: 200,
        }}
        style={[styles.inputContainer, error && styles.errorBorder]}
      >
        <TextInput
          {...props}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
      </MotiView>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 8,
    letterSpacing: typography.letterSpacing.wide,
  },
  inputContainer: {
    backgroundColor: colors.glassLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.glassLight,
    overflow: "hidden",
  },
  input: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontWeight: typography.fontWeight.medium,
  },
  errorBorder: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: 4,
    marginLeft: 4,
  },
});
