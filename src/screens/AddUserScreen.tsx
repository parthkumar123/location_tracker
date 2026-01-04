import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomNavigation } from "../navigation/CustomNavigator";
import { useAlert } from "../hooks/useAlert";
import { ArrowLeft, Save } from "lucide-react-native";
import { GlassCard, GlassInput, GlassButton } from "../components";
import { colors, typography, spacing, theme } from "../theme";
import { authService } from "../services/auth";

export const AddUserScreen: React.FC = () => {
  const navigation = useCustomNavigation();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");

  const handleCreateUser = async () => {
    if (!email || !password || !displayName) {
      showAlert("Error", "Please fill in all fields", "error");
      return;
    }

    if (password.length < 6) {
      showAlert("Error", "Password must be at least 6 characters", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert("Error", "Please enter a valid email address", "error");
      return;
    }

    setLoading(true);
    try {
      await authService.signUp(email, password, displayName, role);
      showAlert("Success", "User created successfully", "success");
      navigation.goBack();
    } catch (error: any) {
      console.error("Error creating user:", error);
      showAlert(
        "Error",
        error.message || "Failed to create user. Email may already be in use.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New User</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>User Information</Text>

          <GlassInput
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter full name"
            autoCapitalize="words"
          />

          <GlassInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <GlassInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password (min 6 characters)"
            secureTextEntry
          />

          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "employee" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("employee")}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "employee" && styles.roleButtonTextActive,
                  ]}
                >
                  Employee
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "admin" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("admin")}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "admin" && styles.roleButtonTextActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <GlassButton
            onPress={handleCreateUser}
            disabled={loading}
            style={styles.createButton}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <View style={styles.buttonContent}>
                <Save size={20} color={colors.textPrimary} />
                <Text style={styles.buttonText}>Create User</Text>
              </View>
            )}
          </GlassButton>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassLight,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.wide,
  },
  roleSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  roleLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roleButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassLight,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  roleButtonActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  roleButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  roleButtonTextActive: {
    color: colors.textPrimary,
  },
  createButton: {
    marginTop: spacing.md,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
});

