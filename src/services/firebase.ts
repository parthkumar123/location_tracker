import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  Auth,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig } from "../config/constants";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  // Validate Firebase config before initializing
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      "Firebase configuration is missing. Please set environment variables."
    );
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Auth with AsyncStorage persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // If auth is already initialized, get the existing instance
    if (error.code === "auth/already-initialized") {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }

  // Initialize Firestore
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Don't throw - let the app handle the error gracefully
}

export { auth, db, app };
