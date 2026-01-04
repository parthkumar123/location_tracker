import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationMenu } from "../navigation/NavigationContext";
import { useCustomNavigation } from "../navigation/CustomNavigator";
import { useAlert } from "../hooks/useAlert";
import {
  Menu,
  Users,
  UserPlus,
  Trash2,
  MapPin,
  Clock,
  UserCheck,
} from "lucide-react-native";
import { GlassCard, PulsingDot } from "../components";
import { colors, typography, spacing, theme } from "../theme";
import { userService } from "../services/userService";
import { locationService } from "../services/location";
import { User, EmployeeStatus } from "../types";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export const UserManagementScreen: React.FC = () => {
  const navigation = useCustomNavigation();
  const { openMenu } = useNavigationMenu();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<
    Map<string, EmployeeStatus>
  >(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);

      // Load employee statuses
      const employees = allUsers.filter((u) => u.role === "employee");
      const statusMap = new Map<string, EmployeeStatus>();

      for (const employee of employees) {
        const location = await locationService.getLatestLocation(employee.uid);
        
        // Check if there are multiple recent locations (indicating active tracking)
        const recentLocationsCount = location 
          ? await locationService.getRecentLocationsCount(employee.uid, 3)
          : 0;
        
        // User is online if:
        // 1. They have a location within 2 minutes, OR
        // 2. They have multiple locations within 3 minutes (indicating active tracking)
        const hasVeryRecentLocation = location && isRecentLocation(location.timestamp, 2);
        const hasActiveTracking = recentLocationsCount >= 2; // At least 2 locations in last 3 minutes
        const isOnline = hasVeryRecentLocation || hasActiveTracking;
        
        statusMap.set(employee.uid, {
          userId: employee.uid,
          displayName: employee.displayName,
          isOnline,
          lastActive: location?.timestamp || new Date(),
          currentLocation: location
            ? { lat: location.lat, lng: location.lng }
            : undefined,
        });
      }

      setEmployeeStatuses(statusMap);
      setLoading(false);
    } catch (error) {
      console.error("Error loading users:", error);
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
    loadUsers();

    // Listen to real-time updates for both users and locations
    const unsubscribeUsers = onSnapshot(collection(db, "users"), () => {
      loadUsers();
    });
    
    const unsubscribeLocations = onSnapshot(collection(db, "locations"), () => {
      loadUsers();
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLocations();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleDeleteUser = (user: User) => {
    if (user.uid === auth.currentUser?.uid) {
      showAlert("Error", "You cannot delete your own account", "error");
      return;
    }

    showAlert(
      "Delete User",
      `Are you sure you want to delete ${user.displayName}? This action cannot be undone.`,
      "warning",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete user document from Firestore
              await deleteDoc(doc(db, "users", user.uid));
              
              // Delete user's location data
              try {
                const locationQuery = await import("firebase/firestore").then(
                  (mod) => mod.getDocs(mod.query(mod.collection(db, "locations"), mod.where("userId", "==", user.uid)))
                );
                const deletePromises = locationQuery.docs.map((doc) =>
                  deleteDoc(doc.ref)
                );
                await Promise.all(deletePromises);
              } catch (locationError) {
                // Continue even if location deletion fails
              }

              showAlert("Success", "User deleted successfully", "success");
              loadUsers();
            } catch (error: any) {
              console.error("Error deleting user:", error);
              // Check if it's a permission error
              if (error.code === "permission-denied" || error.message?.includes("permission")) {
                showAlert(
                  "Permission Error",
                  "You don't have permission to delete users. Please check your Firestore security rules.",
                  "error"
                );
              } else {
                showAlert("Error", error.message || "Failed to delete user", "error");
              }
            }
          },
        },
      ]
    );
  };

  const handleAddUser = () => {
    navigation.navigate("AddUser" as any);
  };

  const formatLastActive = (date: Date | undefined): string => {
    if (!date) return "Never";

    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return "Never";

      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      if (diff < 0) return "Just now";

      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch (error) {
      return "Never";
    }
  };

  const activeCount = Array.from(employeeStatuses.values()).filter(
    (s) => s.isOnline
  ).length;

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
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity
          onPress={handleAddUser}
          style={styles.addButton}
        >
          <UserPlus size={24} color={colors.cyan} />
        </TouchableOpacity>
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
        {/* Summary Cards - Redesigned */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <View style={[styles.summaryIconContainer, { backgroundColor: `${colors.cyan}20` }]}>
                <Users size={20} color={colors.cyan} />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryValue}>{users.length}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
            </View>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <View style={[styles.summaryIconContainer, { backgroundColor: `${colors.success}20` }]}>
                <UserCheck size={20} color={colors.success} />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryValue}>{activeCount}</Text>
                <Text style={styles.summaryLabel}>Active</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Users List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Users</Text>
          {users.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No users found</Text>
            </GlassCard>
          ) : (
            users.map((user) => {
              const status = employeeStatuses.get(user.uid);
              return (
                <GlassCard key={user.uid} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{user.displayName}</Text>
                        <View
                          style={[
                            styles.roleBadge,
                            user.role === "admin"
                              ? styles.roleBadgeAdmin
                              : styles.roleBadgeEmployee,
                          ]}
                        >
                          <Text style={styles.roleText}>
                            {user.role.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>

                    {user.role === "employee" && status && (
                      <View style={styles.statusContainer}>
                        <PulsingDot
                          size={8}
                          color={
                            status.isOnline ? colors.success : colors.textMuted
                          }
                          pulseScale={status.isOnline ? 2 : 1}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            status.isOnline && styles.statusOnline,
                          ]}
                        >
                          {status.isOnline ? "Online" : "Offline"}
                        </Text>
                      </View>
                    )}
                  </View>

                  {user.role === "employee" && status && (
                    <View style={styles.locationDetails}>
                      {status.currentLocation && (
                        <View style={styles.locationRow}>
                          <MapPin size={12} color={colors.cyan} />
                          <Text style={styles.locationText}>
                            {status.currentLocation.lat.toFixed(4)},{" "}
                            {status.currentLocation.lng.toFixed(4)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.locationRow}>
                        <Clock size={12} color={colors.textMuted} />
                        <Text style={styles.lastActiveText}>
                          {formatLastActive(status.lastActive)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {user.uid !== auth.currentUser?.uid && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteUser(user)}
                      >
                        <Trash2 size={16} color={colors.error} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </GlassCard>
              );
            })
          )}
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
  addButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
  },
  summaryCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.xl * 1.2,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
  userCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  roleBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  roleBadgeAdmin: {
    backgroundColor: `${colors.purple}30`,
  },
  roleBadgeEmployee: {
    backgroundColor: `${colors.cyan}30`,
  },
  roleText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.cyan,
  },
  userEmail: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  statusOnline: {
    color: colors.success,
  },
  locationDetails: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.glassLight,
    gap: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  locationText: {
    fontSize: typography.fontSize.xs,
    color: colors.cyan,
    fontFamily: "monospace",
  },
  lastActiveText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.glassLight,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${colors.error}20`,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
});
