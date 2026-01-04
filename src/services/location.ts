import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Location as LocationData } from "../types";

const LOCATION_TASK_NAME = "background-location-task";

export const locationService = {
  // Request location permissions
  requestPermissions: async (): Promise<boolean> => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== "granted") {
      return false;
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    return backgroundStatus === "granted";
  },

  // Start background location tracking
  startTracking: async (userId: string): Promise<void> => {
    const hasPermission = await locationService.requestPermissions();

    if (!hasPermission) {
      throw new Error("Location permissions not granted");
    }

    // Save initial location immediately
    try {
      const currentLocation = await locationService.getCurrentLocation();
      const battery = await import("expo-battery");
      const batteryLevel = await battery.getBatteryLevelAsync();

      const initialLocationData = {
        userId,
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
        timestamp: Timestamp.now(), // Use Firestore Timestamp
        batteryLevel: batteryLevel * 100,
        speed: currentLocation.coords.speed || 0,
        heading: currentLocation.coords.heading,
      };

      await addDoc(collection(db, "locations"), initialLocationData);
    } catch (error) {
      console.error("Error saving initial location:", error);
      // Continue even if initial location save fails
    }

    // Define the background task - always redefine to capture current userId
    if (TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
      TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
    }

    TaskManager.defineTask(
      LOCATION_TASK_NAME,
      async ({ data, error }: any) => {
        if (error) {
          console.error("Background location error:", error);
          return;
        }

        if (data) {
          const { locations } = data;
          if (!locations || locations.length === 0) return;
          
          const location = locations[0];
          
          // Get userId from the location data or use a stored value
          // We'll store userId in AsyncStorage or pass it through task options
          try {
            // Get battery level
            const battery = await import("expo-battery");
            const batteryLevel = await battery.getBatteryLevelAsync();

            // Get userId from AsyncStorage (we'll store it when starting tracking)
            const AsyncStorage = await import("@react-native-async-storage/async-storage");
            const storedUserId = await AsyncStorage.default.getItem("tracking_userId");
            
            if (!storedUserId) {
              console.error("No userId found in storage for location tracking");
              return;
            }

            const locationData = {
              userId: storedUserId,
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              timestamp: Timestamp.now(), // Use Firestore Timestamp
              batteryLevel: batteryLevel * 100,
              speed: location.coords.speed || 0,
              heading: location.coords.heading,
            };

            // Save to Firestore
            await addDoc(collection(db, "locations"), locationData);
          } catch (err) {
            console.error("Error saving location in background task:", err);
          }
        }
      }
    );

    // Store userId in AsyncStorage for the background task
    try {
      const AsyncStorage = await import("@react-native-async-storage/async-storage");
      await AsyncStorage.default.setItem("tracking_userId", userId);
    } catch (error) {
      console.error("Error storing userId:", error);
    }

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 30000, // Update every 30 seconds (reduced for faster updates)
      distanceInterval: 10, // Update every 10 meters (reduced for more frequent updates)
      foregroundService: {
        notificationTitle: "Location Tracking Active",
        notificationBody: "Your location is being tracked",
        notificationColor: "#06b6d4",
      },
    });
  },

  // Stop background location tracking
  stopTracking: async (): Promise<void> => {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );

    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  },

  // Check if tracking is active
  isTracking: async (): Promise<boolean> => {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  },

  // Save current location manually (for foreground tracking)
  saveCurrentLocation: async (userId: string): Promise<void> => {
    try {
      const currentLocation = await locationService.getCurrentLocation();
      const battery = await import("expo-battery");
      const batteryLevel = await battery.getBatteryLevelAsync();

      const locationData = {
        userId,
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
        timestamp: Timestamp.now(), // Use Firestore Timestamp
        batteryLevel: batteryLevel * 100,
        speed: currentLocation.coords.speed || 0,
        heading: currentLocation.coords.heading,
      };

      await addDoc(collection(db, "locations"), locationData);
    } catch (error) {
      console.error("Error saving current location:", error);
      throw error;
    }
  },

  // Get current location
  getCurrentLocation: async (): Promise<Location.LocationObject> => {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  },

  // Get recent locations count (to check if tracking is actively updating)
  getRecentLocationsCount: async (userId: string, minutes: number = 3): Promise<number> => {
    try {
      const cutoffTime = Timestamp.fromMillis(Date.now() - minutes * 60 * 1000);
      
      try {
        const q = query(
          collection(db, "locations"),
          where("userId", "==", userId),
          where("timestamp", ">=", cutoffTime),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
      } catch (error: any) {
        // If query fails (no index), get all and filter
        const allLocationsQuery = query(
          collection(db, "locations"),
          where("userId", "==", userId)
        );
        const allLocationsSnapshot = await getDocs(allLocationsQuery);
        
        let count = 0;
        allLocationsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          let timestamp = data.timestamp;
          
          if (timestamp && typeof timestamp.toDate === 'function') {
            timestamp = timestamp.toDate();
          } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
            timestamp = new Date(timestamp.seconds * 1000);
          } else if (!(timestamp instanceof Date)) {
            timestamp = new Date(timestamp);
          }
          
          if (timestamp instanceof Date && timestamp.getTime() > cutoffTime.toMillis()) {
            count++;
          }
        });
        
        return count;
      }
    } catch (error) {
      console.error("Error getting recent locations count:", error);
      return 0;
    }
  },

  // Get user's latest location from Firestore
  getLatestLocation: async (userId: string): Promise<LocationData | null> => {
    try {
      // First try with orderBy (requires index)
      try {
        const q = query(
          collection(db, "locations"),
          where("userId", "==", userId),
          orderBy("timestamp", "desc"),
          limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          
          // Convert Firestore Timestamp to Date if needed
          let timestamp = data.timestamp;
          if (timestamp && typeof timestamp.toDate === 'function') {
            timestamp = timestamp.toDate();
          } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
            // Handle Firestore Timestamp object
            timestamp = new Date(timestamp.seconds * 1000);
          } else if (!(timestamp instanceof Date)) {
            timestamp = new Date(timestamp);
          }

          const result = {
            ...data,
            timestamp,
          } as LocationData;
          
          return result;
        }
      } catch (orderByError: any) {
        // If orderBy fails (no index), fall back to getting all and filtering
      }

      // Fallback: Get all locations for user and find latest
      const allLocationsQuery = query(
        collection(db, "locations"),
        where("userId", "==", userId)
      );
      const allLocationsSnapshot = await getDocs(allLocationsQuery);

      if (allLocationsSnapshot.empty) {
        return null;
      }

      // Find the latest location by comparing timestamps
      let latestLocation: LocationData | null = null;
      let latestTimestamp: Date | null = null;

      allLocationsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        let timestamp = data.timestamp;
        
        // Convert Firestore Timestamp to Date
        if (timestamp && typeof timestamp.toDate === 'function') {
          timestamp = timestamp.toDate();
        } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
          timestamp = new Date(timestamp.seconds * 1000);
        } else if (!(timestamp instanceof Date)) {
          timestamp = new Date(timestamp);
        }

        if (isNaN(timestamp.getTime())) {
          return;
        }

        if (!latestTimestamp || timestamp.getTime() > latestTimestamp.getTime()) {
          latestTimestamp = timestamp;
          latestLocation = {
            ...data,
            timestamp,
          } as LocationData;
        }
      });

      return latestLocation;
    } catch (error) {
      console.error("Error getting latest location:", error);
      return null;
    }
  },

  // Get all employees' latest locations
  getAllLatestLocations: async (): Promise<LocationData[]> => {
    // This is a simplified version - in production, you'd want to optimize this
    // by maintaining a separate "currentLocations" collection
    const querySnapshot = await getDocs(collection(db, "locations"));

    const locationsByUser = new Map<string, LocationData>();

    querySnapshot.docs.forEach((doc) => {
      const location = doc.data() as LocationData;
      const existing = locationsByUser.get(location.userId);

      if (!existing || location.timestamp > existing.timestamp) {
        locationsByUser.set(location.userId, location);
      }
    });

    return Array.from(locationsByUser.values());
  },
};
