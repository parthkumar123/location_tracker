import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { MotiView } from "moti";
import { LogOut, MapPin, Clock } from "lucide-react-native";
import { GlassCard, PulsingDot } from "../components";
import { colors, typography, spacing, theme } from "../theme";
import { darkMapStyle } from "../config/constants";
import { authService } from "../services/auth";
import { locationService } from "../services/location";
import { User, EmployeeStatus, Location as LocationData } from "../types";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
}) => {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [employees, setEmployees] = useState<EmployeeStatus[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeStatus | null>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  useEffect(() => {
    loadEmployees();

    // Listen to location updates in real-time
    const unsubscribe = onSnapshot(collection(db, "locations"), (snapshot) => {
      updateEmployeeLocations();
    });

    return () => unsubscribe();
  }, []);

  const loadEmployees = async () => {
    try {
      // Get all users with employee role
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", "employee")
      );
      const usersSnapshot = await getDocs(usersQuery);

      const employeeList: EmployeeStatus[] = await Promise.all(
        usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          const location = await locationService.getLatestLocation(doc.id);

          return {
            userId: doc.id,
            displayName: userData.displayName,
            isOnline: location ? isRecentLocation(location.timestamp) : false,
            lastActive: location?.timestamp || new Date(),
            currentLocation: location
              ? { lat: location.lat, lng: location.lng }
              : undefined,
          };
        })
      );

      setEmployees(employeeList);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const updateEmployeeLocations = async () => {
    // Update employee locations in real-time
    loadEmployees();
  };

  const isRecentLocation = (timestamp: Date): boolean => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(timestamp) > fiveMinutesAgo;
  };

  const handleEmployeePress = useCallback((employee: EmployeeStatus) => {
    setSelectedEmployee(employee);

    if (employee.currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: employee.currentLocation.lat,
          longitude: employee.currentLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );

      // Minimize bottom sheet to show map
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, []);

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

  const renderEmployeeItem = ({ item }: { item: EmployeeStatus }) => (
    <TouchableOpacity
      onPress={() => handleEmployeePress(item)}
      activeOpacity={0.7}
    >
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "timing", duration: 150 }}
      >
        <GlassCard style={styles.employeeCard}>
          <View style={styles.employeeHeader}>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{item.displayName}</Text>
              <View style={styles.locationInfo}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={styles.lastActive}>
                  {formatLastActive(item.lastActive)}
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <PulsingDot
                size={10}
                color={item.isOnline ? colors.success : colors.textMuted}
                pulseScale={item.isOnline ? 2 : 1}
              />
              <Text
                style={[
                  styles.statusText,
                  item.isOnline && styles.statusOnline,
                ]}
              >
                {item.isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>

          {item.currentLocation && (
            <View style={styles.coordinates}>
              <MapPin size={12} color={colors.cyan} />
              <Text style={styles.coordinatesText}>
                {item.currentLocation.lat.toFixed(4)},{" "}
                {item.currentLocation.lng.toFixed(4)}
              </Text>
            </View>
          )}
        </GlassCard>
      </MotiView>
    </TouchableOpacity>
  );

  const formatLastActive = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={darkMapStyle}
      >
        {employees.map((employee) =>
          employee.currentLocation ? (
            <Marker
              key={employee.userId}
              coordinate={{
                latitude: employee.currentLocation.lat,
                longitude: employee.currentLocation.lng,
              }}
              title={employee.displayName}
              description={employee.isOnline ? "Online" : "Offline"}
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.marker,
                    {
                      backgroundColor: employee.isOnline
                        ? colors.cyan
                        : colors.textMuted,
                    },
                  ]}
                />
                {employee.isOnline && (
                  <MotiView
                    from={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                      type: "timing",
                      duration: 2000,
                      loop: true,
                    }}
                    style={[
                      styles.markerPulse,
                      { backgroundColor: colors.cyan },
                    ]}
                  />
                )}
              </View>
            </Marker>
          ) : null
        )}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {employees.filter((e) => e.isOnline).length} Online •{" "}
              {employees.length} Total
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.sheetTitle}>Team Members</Text>

          <BottomSheetFlatList
            data={employees}
            renderItem={renderEmployeeItem}
            keyExtractor={(item: EmployeeStatus) => item.userId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: colors.glassLight,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  bottomSheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassLight,
  },
  handleIndicator: {
    backgroundColor: colors.cyan,
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sheetTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.wide,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  employeeCard: {
    marginBottom: spacing.md,
  },
  employeeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lastActive: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  statusOnline: {
    color: colors.success,
  },
  coordinates: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coordinatesText: {
    fontSize: typography.fontSize.xs,
    color: colors.cyan,
    fontFamily: "monospace",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  markerPulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
