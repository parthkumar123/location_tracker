# 🚀 Location Tracker - Cyberpunk Edition

A sophisticated, modern location tracking application built with Expo and Firebase, featuring a stunning Cyberpunk Glassmorphism design.

## ✨ Features

### 🎨 Design

- **Cyberpunk Glassmorphism Theme**: Dark backgrounds with vibrant neon accents (Cyan, Purple, Pink)
- **Frosted Glass Effects**: Utilizing `expo-blur` for beautiful glass cards
- **Smooth Animations**: Using `react-native-reanimated` and `moti` for fluid interactions
- **Custom Map Styling**: Dark-themed map that matches the app aesthetic

### 🔐 Authentication

- **Role-Based Access**: Separate interfaces for Admin and Employee roles
- **Firebase Authentication**: Secure email/password authentication
- **Persistent Sessions**: Auto-login on app restart

### 📍 Location Tracking

- **Background Location**: Continuous tracking using `expo-task-manager`
- **Real-time Updates**: Live location updates on the admin dashboard
- **Battery Monitoring**: Track device battery levels
- **Speed & Distance**: Monitor movement speed and distance covered

### 👨‍💼 Admin Dashboard

- **Interactive Map**: Full-screen map with custom markers
- **Bottom Sheet UI**: Floating employee list over the map
- **Real-time Monitoring**: See which employees are online
- **Employee Details**: View location, status, and activity

### 👷 Employee Interface

- **Status Card**: Large glass card showing online/offline status
- **Swipe-to-Confirm**: Custom slider to start/stop tracking
- **Stats Display**: Hours worked, distance covered, battery level
- **Visual Feedback**: Pulsing animations when tracking is active

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Firebase project created
- Google Maps API key (for Android)

### 1. Clone and Install

```bash
cd location_tracker
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** with Email/Password provider
3. Create a **Firestore Database**
4. Copy your Firebase config
5. Update `src/config/constants.ts` with your Firebase credentials:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. Firestore Rules

Set up your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Locations collection
    match /locations/{locationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

### 4. Google Maps Setup (Android)

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps SDK for Android**
3. Update `app.json` with your API key:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
    }
  }
}
```

### 5. Create Test Users

You'll need to manually create users in Firestore. After signing up a user through Firebase Auth, add a document in the `users` collection:

```javascript
// Admin user
{
  uid: "firebase-auth-uid",
  email: "admin@example.com",
  displayName: "Admin User",
  role: "admin",
  createdAt: new Date()
}

// Employee user
{
  uid: "firebase-auth-uid",
  email: "employee@example.com",
  displayName: "John Doe",
  role: "employee",
  createdAt: new Date()
}
```

### 6. Run the App

#### Development Build (Recommended)

```bash
# Start the development server
npx expo start

# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

#### Expo Go (Limited functionality)

⚠️ Note: Background location tracking requires a development build or standalone app. Expo Go has limitations.

```bash
npx expo start
# Scan QR code with Expo Go app
```

## 📱 Usage

### Admin Login

1. Sign in with admin credentials
2. View the interactive map with employee locations
3. Tap on employees in the bottom sheet to view their location
4. Monitor real-time status updates

### Employee Login

1. Sign in with employee credentials
2. View your tracking status
3. **Swipe the slider** to start/stop location tracking
4. Monitor your stats (hours, distance, battery)

## 🎯 Key Components

### Glass Components

- `GlassCard`: Reusable frosted glass container
- `GlassButton`: Gradient button with glow effects
- `GlassInput`: Floating label input with neon focus
- `PulsingDot`: Animated status indicator

### Custom Components

- `SwipeToConfirm`: Custom swipe-to-activate slider
- Custom map markers with pulsing animations

## 🔧 Technologies Used

- **Expo SDK 54**: React Native framework
- **TypeScript**: Type-safe development
- **Firebase**: Authentication & Firestore database
- **React Native Maps**: Interactive map interface
- **React Native Reanimated**: High-performance animations
- **Moti**: Declarative animations
- **@gorhom/bottom-sheet**: Smooth bottom sheet UI
- **Expo Location**: Location tracking services
- **Expo Task Manager**: Background task execution
- **Expo Blur**: Glassmorphism effects
- **Lucide React Native**: Beautiful icons

## 📂 Project Structure

```
location_tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── GlassCard.tsx
│   │   ├── GlassButton.tsx
│   │   ├── GlassInput.tsx
│   │   ├── PulsingDot.tsx
│   │   └── SwipeToConfirm.tsx
│   ├── screens/             # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── EmployeeHome.tsx
│   │   └── AdminDashboard.tsx
│   ├── services/            # Business logic
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   └── location.ts
│   ├── theme/               # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   ├── config/              # Configuration
│   │   └── constants.ts
│   └── types/               # TypeScript types
│       └── index.ts
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
└── package.json             # Dependencies
```

## 🔐 Permissions

### iOS

- Location Always and When In Use
- Background Location Updates

### Android

- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- FOREGROUND_SERVICE
- FOREGROUND_SERVICE_LOCATION

## 🐛 Troubleshooting

### Location Tracking Not Working

1. Ensure permissions are granted in device settings
2. Check Firebase configuration
3. Verify background location is enabled in `app.json`
4. Use development build (not Expo Go) for full functionality

### Map Not Displaying

1. Verify Google Maps API key is correct
2. Ensure Maps SDK is enabled in Google Cloud Console
3. Check network connectivity

### Authentication Errors

1. Verify Firebase config in `constants.ts`
2. Check Firestore rules are set correctly
3. Ensure user document exists in `users` collection

## 🚀 Building for Production

### iOS

```bash
npx expo build:ios
```

### Android

```bash
npx expo build:android
```

## 📄 License

This project is part of a demonstration and is available for educational purposes.

## 🎨 Design Credits

- Cyberpunk aesthetic inspired by modern UI/UX trends
- Glassmorphism design pattern
- Neon color palette for futuristic feel

---

Built with ❤️ using Expo and Firebase
