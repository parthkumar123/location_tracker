import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface AnimatedViewProps {
  children?: React.ReactNode;
  from?: Record<string, number>;
  animate?: Record<string, number>;
  transition?: {
    type?: "timing" | "spring";
    duration?: number;
    delay?: number;
    loop?: boolean;
  };
  style?: ViewStyle | ViewStyle[];
}

/**
 * Fallback animated view that uses React Native's Animated API
 * instead of MotiView (which requires react-native-reanimated)
 * This allows the app to work with Expo Go
 */
export const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  from = {},
  animate = {},
  transition = { type: "timing", duration: 300 },
  style,
}) => {
  const animatedValues = useRef<Record<string, Animated.Value>>({});

  // Initialize animated values
  useEffect(() => {
    const keys = new Set([...Object.keys(from), ...Object.keys(animate)]);
    keys.forEach((key) => {
      if (!animatedValues.current[key]) {
        const initialValue = from[key] !== undefined ? from[key] : (animate[key] !== undefined ? animate[key] : 0);
        animatedValues.current[key] = new Animated.Value(initialValue);
      }
    });
  }, [from, animate]);

  // Animate values
  useEffect(() => {
    const animations = Object.keys(animate).map((key) => {
      if (animatedValues.current[key]) {
        const config: any = {
          toValue: animate[key],
          duration: transition.duration || 300,
          delay: transition.delay || 0,
          useNativeDriver: key === "scale" || key === "opacity" || key === "translateY" || key === "translateX",
        };
        return Animated.timing(animatedValues.current[key], config);
      }
      return null;
    }).filter(Boolean) as Animated.CompositeAnimation[];

    if (animations.length > 0) {
      const animation = Animated.parallel(animations);
      
      if (transition.loop) {
        Animated.loop(animation).start();
      } else {
        animation.start();
      }
    }
  }, [animate, transition]);

  // Build style object from animated values
  const animatedStyle: any = { transform: [] };
  Object.keys(animatedValues.current).forEach((key) => {
    if (key === "scale") {
      animatedStyle.transform.push({ scale: animatedValues.current[key] });
    } else if (key === "translateY") {
      animatedStyle.transform.push({ translateY: animatedValues.current[key] });
    } else if (key === "translateX") {
      animatedStyle.transform.push({ translateX: animatedValues.current[key] });
    } else if (key === "opacity") {
      animatedStyle.opacity = animatedValues.current[key];
    }
  });

  if (animatedStyle.transform.length === 0) {
    delete animatedStyle.transform;
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

