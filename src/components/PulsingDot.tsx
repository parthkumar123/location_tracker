import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { colors } from "../theme";
import { Easing } from "react-native-reanimated";

interface PulsingDotProps {
  size?: number;
  color?: string;
  pulseScale?: number;
}

export const PulsingDot: React.FC<PulsingDotProps> = ({
  size = 20,
  color = colors.cyan,
  pulseScale = 2,
}) => {
  return (
    <View
      style={[
        styles.container,
        { width: size * pulseScale, height: size * pulseScale },
      ]}
    >
      {/* Pulsing ring */}
      <MotiView
        from={{
          opacity: 0.7,
          scale: 1,
        }}
        animate={{
          opacity: 0,
          scale: pulseScale,
        }}
        transition={{
          type: "timing",
          duration: 2000,
          easing: Easing.out(Easing.ease),
          loop: true,
        }}
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />

      {/* Center dot */}
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
  },
  dot: {
    ...StyleSheet.absoluteFillObject,
    alignSelf: "center",
  },
});
