import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Clock, MapPin, Battery, LogOut } from "lucide-react-native";
import { GlassCard, PulsingDot } from "../components";
import { SwipeToConfirm } from "../components/SwipeToConfirm";
import { colors, typography, spacing, theme } from "../theme";
import { locationService } from "../services/location";
import { authService } from "../services/auth";
import { User, TrackingStats } from "../types";

interface EmployeeHomeProps {
  user: User;
  onLogout: () => void;
}

export const EmployeeHome: React.FC<EmployeeHomeProps> = ({
  user,
  onLogout,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [stats, setStats] = useState<TrackingStats>({
    hoursWorked: 0,
    distanceCovered: 0,
    batteryLevel: 100,
  });

  useEffect(() => {
    checkTrackingStatus();
    loadStats();
  }, []);

  const checkTrackingStatus = async () => {
    const tracking = await locationService.isTracking();
    setIsTracking(tracking);
  };

  const loadStats = async () => {
    // Load stats from storage or calculate from Firestore
    // This is a simplified version
    import("expo-battery").then(async (battery) => {
      const level = await battery.getBatteryLevelAsync();
      setStats((prev) => ({ ...prev, batteryLevel: Math.round(level * 100) }));
    });
  };

  const handleTrackingToggle = async () => {
    try {
      if (isTracking) {
        await locationService.stopTracking();
        setIsTracking(false);
        Alert.alert("Tracking Stopped", "Location tracking has been disabled");
      } else {
        const hasPermission = await locationService.requestPermissions();

        if (!hasPermission) {
          Alert.alert(
            "Permission Required",
            "Location permission is required for tracking. Please enable it in settings."
          );
          return;
        }

        await locationService.startTracking(user.uid);
        setIsTracking(true);
        Alert.alert("Tracking Started", "Your location is now being tracked");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to toggle tracking");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await authService.signOut();
          onLogout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.displayName}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 600 }}
          >
            <GlassCard style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusLabel}>Tracking Status</Text>
                {isTracking && <PulsingDot size={12} color={colors.success} />}
              </View>

              <View style={styles.statusContent}>
                <Text
                  style={[styles.statusText, isTracking && styles.statusActive]}
                >
                  {isTracking ? "You are Online" : "You are Offline"}
                </Text>
                {isTracking && (
                  <Text style={styles.statusSubtext}>
                    Your location is being monitored
                  </Text>
                )}
              </View>

              {/* Breathing animation ring when tracking */}
              {isTracking && (
                <MotiView
                  from={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.1, opacity: 0.8 }}
                  transition={{
                    type: "timing",
                    duration: 2000,
                    loop: true,
                  }}
                  style={styles.breathingRing}
                />
              )}
            </GlassCard>
          </MotiView>

          {/* Swipe to Toggle */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600, delay: 200 }}
            style={styles.swipeContainer}
          >
            <SwipeToConfirm
              onConfirm={handleTrackingToggle}
              isActive={isTracking}
              activeText="Swipe to Stop"
              inactiveText="Swipe to Start"
            />
          </MotiView>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600, delay: 300 }}
              style={styles.statCard}
            >
              <GlassCard>
                <View style={styles.statIconContainer}>
                  <Clock size={24} color={colors.cyan} />
                </View>
                <Text style={styles.statValue}>
                  {stats.hoursWorked.toFixed(1)}h
                </Text>
                <Text style={styles.statLabel}>Hours Worked</Text>
              </GlassCard>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600, delay: 400 }}
              style={styles.statCard}
            >
              <GlassCard>
                <View style={styles.statIconContainer}>
                  <MapPin size={24} color={colors.purple} />
                </View>
                <Text style={styles.statValue}>
                  {stats.distanceCovered.toFixed(1)} km
                </Text>
                <Text style={styles.statLabel}>Distance</Text>
              </GlassCard>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600, delay: 500 }}
              style={styles.statCard}
            >
              <GlassCard>
                <View style={styles.statIconContainer}>
                  <Battery size={24} color={colors.pink} />
                </View>
                <Text style={styles.statValue}>{stats.batteryLevel}%</Text>
                <Text style={styles.statLabel}>Battery</Text>
              </GlassCard>
            </MotiView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  statusCard: {
    marginBottom: spacing.xl,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
  statusContent: {
    alignItems: "center",
  },
  statusText: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  statusActive: {
    color: colors.success,
  },
  statusSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  breathingRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.success,
  },
  swipeContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  statCard: {
    width: "31%",
  },
  statIconContainer: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
});
