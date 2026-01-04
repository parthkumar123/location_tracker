import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomNavigation } from "../navigation/CustomNavigator";
import { useAlert } from "../hooks/useAlert";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Camera,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Save,
} from "lucide-react-native";
import { GlassCard, GlassInput, GlassButton } from "../components";
import { colors, typography, spacing, theme } from "../theme";
import { authService } from "../services/auth";
import { userService } from "../services/userService";
import { User } from "../types";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export const ProfileScreen: React.FC = () => {
  const navigation = useCustomNavigation();
  const { showAlert } = useAlert();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigation.goBack();
        return;
      }

      const userData = await authService.getCurrentUser(currentUser);
      if (userData) {
        setUser(userData);
        setDisplayName(userData.displayName);
        setPhoneNumber(userData.phoneNumber || "");
        setPhotoURL(userData.photoURL || null);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        "Permission Required",
        "Please grant camera roll permissions to update your profile photo",
        "warning"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        "Permission Required",
        "Please grant camera permissions to take a photo",
        "warning"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const removeImage = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update user document in Firestore to remove photoURL
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        photoURL: null,
      });

      setPhotoURL(null);
      showAlert("Success", "Profile photo removed successfully", "success");
      await loadUserData(); // Reload to get updated user data
    } catch (error: any) {
      console.error("Error removing photo:", error);
      showAlert("Error", error.message || "Failed to remove profile photo", "error");
    } finally {
      setSaving(false);
    }
  };

  const showImagePicker = () => {
    const buttons: any[] = [
      { text: "Cancel", style: "cancel" },
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
    ];
    
    if (photoURL) {
      buttons.push({ text: "Remove Photo", style: "destructive", onPress: removeImage });
    }
    
    showAlert(
      "Update Profile Photo",
      "Choose an option",
      "info",
      buttons
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update user document in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
        phoneNumber: phoneNumber || null,
        photoURL: photoURL || null,
      });

      showAlert("Success", "Profile updated successfully", "success");
      await loadUserData();
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert("Error", "Please fill in all password fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Error", "New passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showAlert("Error", "Password must be at least 6 characters", "error");
      return;
    }

    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("User not authenticated");
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      showAlert("Success", "Password updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showAlert(
        "Error",
        error.message || "Failed to update password. Please check your current password.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cyan} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={showImagePicker}
            >
              <Camera size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoHint}>Tap to update photo</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <GlassCard style={styles.card}>
            <GlassInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
            />
            <GlassInput
              label="Email"
              value={user.email}
              editable={false}
              style={styles.disabledInput}
            />
            <GlassInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <GlassButton
              onPress={handleSaveProfile}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </GlassButton>
          </GlassCard>
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <GlassCard style={styles.card}>
            <GlassInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              secureTextEntry
            />
            <GlassInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
            <GlassInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
            />
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={saving}
              style={[
                styles.updatePasswordButton,
                saving && styles.updatePasswordButtonDisabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={colors.cyan} />
              ) : (
                <View style={styles.updatePasswordButtonContent}>
                  <Lock size={20} color={colors.cyan} />
                  <Text style={styles.updatePasswordButtonText}>
                    Update Password
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
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
  photoSection: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.cyan,
  },
  avatarPlaceholder: {
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  photoHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.wide,
  },
  card: {
    padding: spacing.md,
  },
  disabledInput: {
    opacity: 0.6,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  updatePasswordButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  updatePasswordButtonDisabled: {
    opacity: 0.5,
  },
  updatePasswordButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  updatePasswordButtonText: {
    color: colors.cyan,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
});

