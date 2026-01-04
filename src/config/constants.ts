// Firebase Configuration
// Values are read from .env file (development) or app.json extra (production)

import Constants from "expo-constants";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

// Get Firebase config from multiple sources (priority order):
// 1. app.json extra.firebase (for production builds)
// 2. Environment variables from @env (for development)
// 3. process.env (fallback)
const getFirebaseConfig = () => {
  // Try to get from app.json extra first (for production builds)
  const extraConfig = Constants.expoConfig?.extra?.firebase;
  
  if (extraConfig && extraConfig.apiKey) {
    return {
      apiKey: extraConfig.apiKey || "",
      authDomain: extraConfig.authDomain || "",
      projectId: extraConfig.projectId || "",
      storageBucket: extraConfig.storageBucket || "",
      messagingSenderId: extraConfig.messagingSenderId || "",
      appId: extraConfig.appId || "",
    };
  }
  
  // Fallback to environment variables
  return {
    apiKey: FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
    authDomain: FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "",
    projectId: FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "",
    storageBucket: FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
  };
};

export const firebaseConfig = getFirebaseConfig();

// Validate that all required env variables are set
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
  console.warn("⚠️ FIREBASE_API_KEY is not set in .env file");
}
if (!firebaseConfig.projectId || firebaseConfig.projectId === "") {
  console.warn("⚠️ FIREBASE_PROJECT_ID is not set in .env file");
}

// Map Style for Dark Mode
export const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#1e293b",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#cbd5e1",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#0f172a",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        color: "#64748b",
      },
    ],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#8b5cf6",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#cbd5e1",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#94a3b8",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#334155",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#10b981",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#334155",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#94a3b8",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#475569",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#06b6d4",
      },
      {
        lightness: -50,
      },
    ],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [
      {
        color: "#8b5cf6",
      },
      {
        lightness: -40,
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#64748b",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#94a3b8",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#0f172a",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#475569",
      },
    ],
  },
];
