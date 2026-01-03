# 🚀 Quick Reference Guide

## 🎯 Common Tasks

### Starting the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run dev:ios

# Run on Android emulator
npm run dev:android

# Clear cache and restart
npx expo start -c
```

### Building the App

```bash
# Production build for Android
npm run build:android

# Production build for iOS
npm run build:ios

# Development build
npx expo run:android
npx expo run:ios
```

## 🎨 Customizing the Theme

### Change Color Scheme

Edit `src/theme/colors.ts`:

```typescript
export const colors = {
  cyan: "#YOUR_COLOR", // Primary accent
  purple: "#YOUR_COLOR", // Secondary accent
  pink: "#YOUR_COLOR", // Tertiary accent
  // ...
};
```

### Adjust Spacing

Edit `src/theme/spacing.ts`:

```typescript
export const spacing = {
  sm: 8, // Small spacing
  md: 16, // Medium spacing
  lg: 24, // Large spacing
  // ...
};
```

### Modify Typography

Edit `src/theme/typography.ts`:

```typescript
export const typography = {
  fontSize: {
    base: 16, // Base font size
    lg: 18, // Large text
    // ...
  },
};
```

## 🔐 Firebase Setup

### Update Firebase Config

Edit `src/config/constants.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /locations/{locationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## 📍 Location Tracking

### Adjust Tracking Intervals

Edit `src/services/location.ts`:

```typescript
await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  accuracy: Location.Accuracy.High,
  timeInterval: 60000, // Update every X ms (60000 = 1 min)
  distanceInterval: 50, // Update every X meters
});
```

### Change Foreground Service Notification

```typescript
foregroundService: {
  notificationTitle: 'Your Title',
  notificationBody: 'Your Message',
  notificationColor: '#06b6d4',
}
```

## 🗺️ Map Customization

### Update Map Style

Edit `src/config/constants.ts` and modify `darkMapStyle` array

### Change Initial Map Region

Edit `src/screens/AdminDashboard.tsx`:

```typescript
const initialRegion = {
  latitude: 37.78825, // Your latitude
  longitude: -122.4324, // Your longitude
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};
```

### Customize Markers

Edit marker style in `AdminDashboard.tsx`:

```typescript
<View
  style={[
    styles.marker,
    {
      backgroundColor: colors.cyan, // Marker color
      width: 20, // Marker size
      height: 20,
    },
  ]}
/>
```

## 🎭 Animation Settings

### Pulse Animation Speed

Edit `PulsingDot.tsx`:

```typescript
transition={{
  type: 'timing',
  duration: 2000,  // Animation duration in ms
  loop: true,
}}
```

### Swipe-to-Confirm Sensitivity

Edit `SwipeToConfirm.tsx`:

```typescript
if (translateX.value > SWIPE_RANGE * 0.8) {
  // Change 0.8 to adjust
  // Confirmed
}
```

## 🧪 Testing

### Create Test Users

**Admin User:**

```
Email: admin@test.com
Password: admin123
Role: admin
```

**Employee User:**

```
Email: employee@test.com
Password: employee123
Role: employee
```

### Test Location Tracking

1. Login as employee
2. Grant all location permissions
3. Swipe to start tracking
4. Open admin account on another device
5. See employee location on map

## 🐛 Debugging

### Enable Debug Mode

```typescript
// Add to App.tsx
if (__DEV__) {
  console.log("Debug mode enabled");
}
```

### View Firestore Data

```typescript
// Add temporary logging in services
console.log("Location saved:", locationData);
console.log("User data:", userData);
```

### Check Permissions

```typescript
import * as Location from "expo-location";

const checkPermissions = async () => {
  const { status } = await Location.getForegroundPermissionsAsync();
  console.log("Foreground permission:", status);

  const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
  console.log("Background permission:", bgStatus);
};
```

## 📱 Platform-Specific

### iOS Only Settings

Edit `app.json`:

```json
"ios": {
  "bundleIdentifier": "com.yourcompany.app",
  "infoPlist": {
    "NSLocationAlwaysAndWhenInUseUsageDescription": "Your message"
  }
}
```

### Android Only Settings

Edit `app.json`:

```json
"android": {
  "package": "com.yourcompany.app",
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_BACKGROUND_LOCATION"
  ]
}
```

## 🔧 Troubleshooting

### Reset Everything

```bash
# Delete cache and node_modules
rm -rf node_modules
rm -rf .expo
npm cache clean --force

# Reinstall
npm install

# Start fresh
npx expo start -c
```

### Fix Metro Bundler Issues

```bash
# Kill all node processes
killall -9 node

# Restart
npm start
```

### Fix iOS Simulator

```bash
# Reset simulator
xcrun simctl erase all

# Rebuild
npx expo run:ios
```

### Fix Android Emulator

```bash
# Cold boot emulator
adb reboot

# Clear app data
adb shell pm clear com.yourcompany.locationtracker
```

## 📦 Adding New Features

### Add a New Component

1. Create file: `src/components/YourComponent.tsx`
2. Export in: `src/components/index.ts`
3. Use in screens: `import { YourComponent } from '../components'`

### Add a New Screen

1. Create file: `src/screens/YourScreen.tsx`
2. Export in: `src/screens/index.ts`
3. Add navigation in `App.tsx`

### Add a New Service

1. Create file: `src/services/yourService.ts`
2. Implement functions
3. Import where needed

## 🎨 UI Component Library

### Glass Card

```typescript
<GlassCard style={{ padding: 20 }}>
  <Text>Your content</Text>
</GlassCard>
```

### Glass Button

```typescript
<GlassButton
  onPress={handlePress}
  variant="primary" // or "secondary", "outline"
>
  <Text>Button Text</Text>
</GlassButton>
```

### Glass Input

```typescript
<GlassInput
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  error={errorMessage}
/>
```

### Pulsing Dot

```typescript
<PulsingDot size={20} color={colors.cyan} pulseScale={2} />
```

### Swipe to Confirm

```typescript
<SwipeToConfirm
  onConfirm={handleConfirm}
  isActive={isTracking}
  activeText="Swipe to Stop"
  inactiveText="Swipe to Start"
/>
```

## 📊 Useful Commands

```bash
# Check TypeScript errors
npm run type-check

# View app on device
npx expo start --tunnel

# View logs
npx expo start --log

# Clear watchman cache
watchman watch-del-all

# Update all dependencies
npm update

# Check outdated packages
npm outdated
```

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Console](https://console.firebase.google.com/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Bottom Sheet](https://gorhom.github.io/react-native-bottom-sheet/)

---

Quick tip: Press `Cmd+K` in VS Code to open command palette!
