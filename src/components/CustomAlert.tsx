import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { AlertCircle, CheckCircle, Info } from "lucide-react-native";
import { colors, typography, spacing, theme } from "../theme";

export type AlertType = "success" | "error" | "info" | "warning";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = "info",
  buttons = [{ text: "OK" }],
  onDismiss,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      // Reset animation values when showing
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      setShouldRender(true);
      
      // Start animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out before hiding
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Only hide after animation completes
        setShouldRender(false);
      });
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={48} color={colors.success} />;
      case "error":
        return <AlertCircle size={48} color={colors.error} />;
      case "warning":
        return <AlertCircle size={48} color={colors.warning} />;
      default:
        return <Info size={48} color={colors.cyan} />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return colors.success;
      case "error":
        return colors.error;
      case "warning":
        return colors.warning;
      default:
        return colors.cyan;
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!shouldRender && !visible) return null;

  return (
    <Modal
      visible={visible || shouldRender}
      transparent={true}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onDismiss}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.alertCard}>
            <BlurView intensity={20} tint="dark" style={styles.blurView}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <View
                    style={[
                      styles.iconBackground,
                      { backgroundColor: `${getIconColor()}20` },
                    ]}
                  >
                    {getIcon()}
                  </View>
                </View>

                <Text style={styles.title}>{title}</Text>
                {message && <Text style={styles.message}>{message}</Text>}

                <View style={styles.buttonContainer}>
                  {buttons
                    .sort((a, b) => {
                      // Sort: cancel buttons go last, destructive buttons go first
                      if (a.style === "cancel") return 1;
                      if (b.style === "cancel") return -1;
                      if (a.style === "destructive") return -1;
                      if (b.style === "destructive") return 1;
                      return 0;
                    })
                    .map((button, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.button,
                          button.style === "destructive" && styles.destructiveButton,
                          button.style === "cancel" && styles.cancelButton,
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            button.style === "destructive" && styles.destructiveButtonText,
                            button.style === "cancel" && styles.cancelButtonText,
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit={true}
                          minimumFontScale={0.8}
                        >
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            </BlurView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  alertContainer: {
    width: "100%",
    maxWidth: 400,
    zIndex: 1000,
  },
  alertCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassLight,
  },
  blurView: {
    borderRadius: theme.borderRadius.lg,
  },
  cardContent: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    padding: spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.fontSize.xl,
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
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    gap: spacing.sm,
  },
  button: {
    width: "100%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassLight,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonWithMargin: {
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderColor: colors.glassLight,
  },
  destructiveButton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: colors.error,
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
    textAlign: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
  destructiveButtonText: {
    color: colors.error,
  },
});
