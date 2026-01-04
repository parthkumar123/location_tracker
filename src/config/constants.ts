// Firebase Configuration
// Values are read from .env file using react-native-dotenv

import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY || "",
  authDomain: FIREBASE_AUTH_DOMAIN || "",
  projectId: FIREBASE_PROJECT_ID || "",
  storageBucket: FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || "",
  appId: FIREBASE_APP_ID || "",
};

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
