import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationMenu } from "../navigation/NavigationContext";
import { useCustomNavigation } from "../navigation/CustomNavigator";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { AnimatedView } from "../components/AnimatedView";
import { Menu, MapPin, Clock, RefreshCw } from "lucide-react-native";
import { GlassCard, PulsingDot } from "../components";
import { colors, typography, spacing, theme } from "../theme";
import { darkMapStyle } from "../config/constants";
import { locationService } from "../services/location";
import { EmployeeStatus } from "../types";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const MapViewScreen: React.FC = () => {
  const navigation = useCustomNavigation();
  const { openMenu } = useNavigationMenu();
  const mapRef = useRef<MapView>(null);
  const [employees, setEmployees] = useState<EmployeeStatus[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadEmployees();

    // Listen to location updates in real-time
    const unsubscribeLocations = onSnapshot(collection(db, "locations"), () => {
      loadEmployees();
    });
    
    // Also listen to users collection for any user changes
    const unsubscribeUsers = onSnapshot(collection(db, "users"), () => {
      loadEmployees();
    });

    return () => {
      unsubscribeLocations();
      unsubscribeUsers();
    };
  }, []);

  // Add rotation animation for refresh icon
  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [refreshing, rotateAnim]);
  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loadEmployees = async (showLoading = false) => {
    if (showLoading) {
      setRefreshing(true);
    }
    
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", "employee")
      );
      const usersSnapshot = await getDocs(usersQuery);

      const employeeList: EmployeeStatus[] = await Promise.all(
        usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
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
          
          return {
            userId: doc.id,
            displayName: userData.displayName,
            isOnline,
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
    } finally {
      if (showLoading) {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = async () => {
    await loadEmployees(true);
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
    }
  }, []);

  const renderEmployeeItem = ({ item }: { item: EmployeeStatus }) => (
    <TouchableOpacity
      onPress={() => handleEmployeePress(item)}
      activeOpacity={0.7}
    >
      <AnimatedView
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
      </AnimatedView>
    </TouchableOpacity>
  );

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
        mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
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
                  <AnimatedView
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
      <SafeAreaView style={styles.header} edges={["top"]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={openMenu}
            style={styles.menuButton}
          >
            <Menu size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Map View</Text>
            <Text style={styles.headerSubtitle}>
              {employees.filter((e) => e.isOnline).length} Online •{" "}
              {employees.length} Total
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
            disabled={refreshing}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <RefreshCw 
                size={24} 
                color={refreshing ? colors.textMuted : colors.cyan}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheetContainer}>
        <View style={styles.bottomSheetBackground}>
          <View style={styles.handleIndicator} />
          <View style={styles.bottomSheetContent}>
            <Text style={styles.sheetTitle}>Team Members</Text>

            <FlatList
              data={employees}
              renderItem={renderEmployeeItem}
              keyExtractor={(item: EmployeeStatus) => item.userId}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
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
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: colors.glassLight,
  },
  menuButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  refreshButton: {
    padding: spacing.sm,
    marginLeft: spacing.md,
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
  bottomSheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    zIndex: 10,
  },
  bottomSheetBackground: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassLight,
  },
  handleIndicator: {
    backgroundColor: colors.cyan,
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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

