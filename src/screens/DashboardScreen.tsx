import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Menu, Users, UserCheck, UserX, Map } from "lucide-react-native";
import { GlassCard } from "../components";
import { colors, typography, spacing, theme } from "../theme";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { locationService } from "../services/location";
import { EmployeeStatus } from "../types";
import { useNavigationMenu } from "../navigation/NavigationContext";
import { useCustomNavigation } from "../navigation/CustomNavigator";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export const DashboardScreen: React.FC = () => {
  const navigation = useCustomNavigation();
  const { openMenu } = useNavigationMenu();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      // Get all users
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // Get all employees
      const employeesQuery = query(
        collection(db, "users"),
        where("role", "==", "employee")
      );
      const employeesSnapshot = await getDocs(employeesQuery);

      let activeCount = 0;
      let inactiveCount = 0;

      // Check each employee's location status
      const employeeChecks = employeesSnapshot.docs.map(async (doc) => {
        const location = await locationService.getLatestLocation(doc.id);
        
        // Check if there are multiple recent locations (indicating active tracking)
        const recentLocationsCount = location 
          ? await locationService.getRecentLocationsCount(doc.id, 3)
          : 0;
        
        // User is online if:
        // 1. They have a location within 2 minutes, OR
        // 2. They have multiple locations within 3 minutes (indicating active tracking)
        const hasVeryRecentLocation = location && isRecentLocation(location.timestamp, 2);
        const hasActiveTracking = recentLocationsCount >= 2; // At least 2 locations in last 3 minutes
        const isOnline = hasVeryRecentLocation || hasActiveTracking;
        
        if (isOnline) {
          activeCount++;
        } else {
          inactiveCount++;
        }
      });

      await Promise.all(employeeChecks);

      setStats({
        totalUsers,
        activeUsers: activeCount,
        inactiveUsers: inactiveCount,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading stats:", error);
      setLoading(false);
    }
  };

  const isRecentLocation = (timestamp: Date | any, minutes: number = 2): boolean => {
    if (!timestamp) {
      return false;
    }
    
    // Handle Firestore Timestamp
    let date: Date;
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) {
      return false;
    }
    
    const now = Date.now();
    const dateTime = date.getTime();
    const cutoffTime = new Date(now - minutes * 60 * 1000);
    const isRecent = dateTime > cutoffTime.getTime();
    
    return isRecent;
  };

  useEffect(() => {
    loadStats();

    // Listen to real-time updates for both users and locations
    const unsubscribeUsers = onSnapshot(collection(db, "users"), () => {
      loadStats();
    });
    
    const unsubscribeLocations = onSnapshot(collection(db, "locations"), () => {
      loadStats();
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLocations();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    onPress?: () => void;
  }> = ({ title, value, icon: Icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard style={styles.statCard}>
        <View style={styles.statCardContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Icon size={32} color={color} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={openMenu}
          style={styles.menuButton}
        >
          <Menu size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.cyan}
          />
        }
      >
        {/* Stats - One per row */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color={colors.cyan}
            onPress={() => navigation.navigate("UserManagement")}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={UserCheck}
            color={colors.success}
            onPress={() => navigation.navigate("MapView")}
          />
          <StatCard
            title="Inactive Users"
            value={stats.inactiveUsers}
            icon={UserX}
            color={colors.textMuted}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <GlassCard style={styles.actionCard}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("MapView")}
            >
              <Map size={24} color={colors.cyan} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>View Map</Text>
                <Text style={styles.actionSubtitle}>
                  See all employee locations
                </Text>
              </View>
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.actionCard}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("UserManagement")}
            >
              <Users size={24} color={colors.purple} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Manage Users</Text>
                <Text style={styles.actionSubtitle}>
                  Add, edit, or remove users
                </Text>
              </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassLight,
  },
  menuButton: {
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
    padding: spacing.lg,
  },
  statsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: "100%",
  },
  statCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.wide,
  },
  actionCard: {
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

