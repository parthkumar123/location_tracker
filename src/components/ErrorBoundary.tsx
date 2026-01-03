import React, { Component, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle } from "lucide-react-native";
import { colors, typography, spacing } from "../theme";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={["#0f172a", "#1e293b"]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertCircle size={80} color={colors.error} />
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error?.message || "An unexpected error occurred"}
            </Text>

            <TouchableOpacity
              onPress={this.handleReset}
              style={styles.button}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradientCyanPurple}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize["3xl"],
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
    marginBottom: spacing["2xl"],
    lineHeight: 24,
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
});
