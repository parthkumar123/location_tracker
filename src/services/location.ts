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

    // Define the background task if not already defined
    if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
      TaskManager.defineTask(
        LOCATION_TASK_NAME,
        async ({ data, error }: any) => {
          if (error) {
            console.error("Background location error:", error);
            return;
          }

          if (data) {
            const { locations } = data;
            const location = locations[0];

            // Get battery level
            const battery = await import("expo-battery");
            const batteryLevel = await battery.getBatteryLevelAsync();

            const locationData: LocationData = {
              userId,
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              timestamp: new Date(location.timestamp),
              batteryLevel: batteryLevel * 100,
              speed: location.coords.speed || 0,
              heading: location.coords.heading,
            };

            // Save to Firestore
            await addDoc(collection(db, "locations"), locationData);
          }
        }
      );
    }

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 60000, // Update every 1 minute
      distanceInterval: 50, // Update every 50 meters
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

  // Get current location
  getCurrentLocation: async (): Promise<Location.LocationObject> => {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  },

  // Get user's latest location from Firestore
  getLatestLocation: async (userId: string): Promise<LocationData | null> => {
    const q = query(
      collection(db, "locations"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as LocationData;
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
