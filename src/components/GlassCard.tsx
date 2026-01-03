import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { colors } from "../theme";

interface GlassCardProps {
  children: ReactNode;
  intensity?: number;
  style?: ViewStyle;
  blurType?: "light" | "dark";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 20,
  style,
  blurType = "dark",
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={blurType} style={styles.blur}>
        <View style={styles.glassBorder}>
          <View style={styles.content}>{children}</View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  blur: {
    flex: 1,
  },
  glassBorder: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassLight,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
