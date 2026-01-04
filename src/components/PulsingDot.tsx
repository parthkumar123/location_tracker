import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors } from "../theme";

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
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0.7)).current;

  React.useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: pulseScale,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(animation).start();
  }, [scaleAnim, opacityAnim, pulseScale]);

  return (
    <View
      style={[
        styles.container,
        { width: size * pulseScale, height: size * pulseScale },
      ]}
    >
      {/* Pulsing ring */}
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
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
