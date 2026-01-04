import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationMenu } from "../navigation/NavigationContext";
import { useCustomNavigation } from "../navigation/CustomNavigator";
import { useUserContext } from "../navigation/UserContext";
import { useAlert } from "../hooks/useAlert";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedView } from "../components/AnimatedView";
import { Clock, MapPin, Battery, Menu } from "lucide-react-native";
import { GlassCard, PulsingDot } from "../components";
import { SwipeToConfirm } from "../components/SwipeToConfirm";
import { colors, typography, spacing, theme } from "../theme";
import { locationService } from "../services/location";
import { TrackingStats } from "../types";

export const EmployeeHome: React.FC = () => {
  const navigation = useCustomNavigation();
  const { openMenu } = useNavigationMenu();
  const { user, onLogout } = useUserContext();
  const { showAlert } = useAlert();
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

  // Separate effect for periodic location saving
  useEffect(() => {
    let locationInterval: NodeJS.Timeout | null = null;
    
    if (isTracking) {
      // Save location immediately when tracking starts
      locationService.saveCurrentLocation(user.uid).catch((error) => {
        console.error("Error saving initial location:", error);
      });
      
      // Then save every 30 seconds
      locationInterval = setInterval(() => {
        locationService.saveCurrentLocation(user.uid).catch((error) => {
          console.error("Error saving periodic location:", error);
        });
      }, 30000);
    }
    
    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [isTracking, user.uid]);

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
        showAlert("Tracking Stopped", "Location tracking has been disabled", "info");
      } else {
        const hasPermission = await locationService.requestPermissions();

        if (!hasPermission) {
          showAlert(
            "Permission Required",
            "Location permission is required for tracking. Please enable it in settings.",
            "warning"
          );
          return;
        }

        await locationService.startTracking(user.uid);
        setIsTracking(true);
        showAlert("Tracking Started", "Your location is now being tracked", "success");
      }
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to toggle tracking", "error");
    }
  };


  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openMenu}
            style={styles.menuButton}
          >
            <Menu size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.displayName}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Card */}
          <AnimatedView
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
                <AnimatedView
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
          </AnimatedView>

          {/* Swipe to Toggle */}
          <AnimatedView
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
          </AnimatedView>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <AnimatedView
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
            </AnimatedView>

            <AnimatedView
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
            </AnimatedView>

            <AnimatedView
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
            </AnimatedView>
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
  menuButton: {
    padding: spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerRight: {
    width: 40,
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
