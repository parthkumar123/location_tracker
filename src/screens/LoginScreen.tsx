import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { GlassCard, GlassButton, GlassInput } from "../components";
import { colors, typography, spacing, theme } from "../theme";
import { authService } from "../services/auth";
import { User } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      onLoginSuccess(user);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated gradient background */}
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated neon orbs in background */}
      <MotiView
        from={{
          opacity: 0.3,
          scale: 1,
        }}
        animate={{
          opacity: 0.6,
          scale: 1.2,
        }}
        transition={{
          type: "timing",
          duration: 4000,
          loop: true,
        }}
        style={[styles.orb, styles.orbCyan]}
      />
      <MotiView
        from={{
          opacity: 0.3,
          scale: 1.2,
        }}
        animate={{
          opacity: 0.6,
          scale: 1,
        }}
        transition={{
          type: "timing",
          duration: 4000,
          loop: true,
        }}
        style={[styles.orb, styles.orbPurple]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{
              opacity: 0,
              translateY: -50,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              type: "timing",
              duration: 800,
            }}
            style={styles.contentContainer}
          >
            {/* Logo/Title */}
            <View style={styles.header}>
              <Text style={styles.title}>Location Tracker</Text>
              <Text style={styles.subtitle}>Cyberpunk Edition</Text>
            </View>

            {/* Login Form */}
            <GlassCard style={styles.formCard}>
              <Text style={styles.formTitle}>Sign In</Text>

              <GlassInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <GlassInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <GlassButton
                onPress={handleLogin}
                disabled={loading}
                style={styles.loginButton}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Signing In..." : "Sign In"}
                </Text>
              </GlassButton>

              <Text style={styles.helpText}>
                Use your credentials to access the system
              </Text>
            </GlassCard>

            {/* Footer info */}
            <Text style={styles.footerText}>
              © 2026 Location Tracker • Secured by Firebase
            </Text>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  contentContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  title: {
    fontSize: typography.fontSize["4xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.cyan,
    letterSpacing: typography.letterSpacing.widest,
    textTransform: "uppercase",
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    letterSpacing: typography.letterSpacing.wide,
  },
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  helpText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
  footerText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  orb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.3,
  },
  orbCyan: {
    backgroundColor: colors.cyan,
    top: -100,
    right: -100,
  },
  orbPurple: {
    backgroundColor: colors.purple,
    bottom: -100,
    left: -100,
  },
});
