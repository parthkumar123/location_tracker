# 🚀 Quick Setup Guide

Follow these steps to get your Location Tracker app up and running.

## Step 1: Firebase Setup (5 minutes)

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Location Tracker"
4. Disable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

### 1.3 Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add rules later)
4. Select a location closest to you
5. Click "Enable"

### 1.4 Set Firestore Rules

1. Go to "Firestore Database" → "Rules" tab
2. Paste the following rules:

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
      allow update, delete: if false;
    }
  }
}
```

3. Click "Publish"

### 1.5 Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register app with nickname "Location Tracker Web"
5. Copy the `firebaseConfig` object
6. Update `src/config/constants.ts` with your config

## Step 2: Google Maps Setup (Android only, 3 minutes)

### 2.1 Enable Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Enable "Maps SDK for Android"
4. Go to "Credentials"
5. Create API Key (restrict to Android if desired)
6. Copy the API key

### 2.2 Update Configuration

Open `app.json` and replace:

```json
"config": {
  "googleMaps": {
    "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
  }
}
```

## Step 3: Create Test Users

### Option A: Using Firebase Console (Recommended)

1. **Create Admin User:**

   - Go to Firebase Authentication
   - Click "Add user"
   - Email: `admin@test.com`
   - Password: `admin123`
   - Click "Add user"
   - Copy the User UID

2. **Add Admin Document in Firestore:**

   - Go to Firestore Database
   - Click "Start collection"
   - Collection ID: `users`
   - Document ID: [paste the User UID]
   - Add fields:
     ```
     uid: [User UID]
     email: admin@test.com
     displayName: Admin User
     role: admin
     createdAt: [current timestamp]
     ```
   - Click "Save"

3. **Create Employee User:**

   - Go to Firebase Authentication
   - Click "Add user"
   - Email: `employee@test.com`
   - Password: `employee123`
   - Click "Add user"
   - Copy the User UID

4. **Add Employee Document in Firestore:**
   - Go to Firestore Database → users collection
   - Click "Add document"
   - Document ID: [paste the User UID]
   - Add fields:
     ```
     uid: [User UID]
     email: employee@test.com
     displayName: John Doe
     role: employee
     createdAt: [current timestamp]
     ```
   - Click "Save"

### Option B: Using JavaScript (Advanced)

Create a script `scripts/createUsers.js`:

```javascript
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const createUsers = async () => {
  const auth = admin.auth();
  const db = admin.firestore();

  // Create admin
  const adminUser = await auth.createUser({
    email: "admin@test.com",
    password: "admin123",
    displayName: "Admin User",
  });

  await db.collection("users").doc(adminUser.uid).set({
    uid: adminUser.uid,
    email: "admin@test.com",
    displayName: "Admin User",
    role: "admin",
    createdAt: new Date(),
  });

  // Create employee
  const employeeUser = await auth.createUser({
    email: "employee@test.com",
    password: "employee123",
    displayName: "John Doe",
  });

  await db.collection("users").doc(employeeUser.uid).set({
    uid: employeeUser.uid,
    email: "employee@test.com",
    displayName: "John Doe",
    role: "employee",
    createdAt: new Date(),
  });

  console.log("Users created successfully!");
};

createUsers();
```

## Step 4: Run the App

### 4.1 Install Dependencies (if not done)

```bash
npm install
```

### 4.2 Start Development Server

```bash
npx expo start
```

### 4.3 Run on Device

#### iOS (Mac required)

```bash
npx expo run:ios
```

#### Android

```bash
npx expo run:android
```

#### Using Physical Device

1. Install "Expo Go" from App Store / Play Store
2. Scan QR code from terminal
3. ⚠️ Note: Background tracking requires development build

## Step 5: Test the App

### Test Admin Flow

1. Open the app
2. Login with:
   - Email: `admin@test.com`
   - Password: `admin123`
3. You should see the Admin Dashboard with map
4. Employees will appear in the bottom sheet once they start tracking

### Test Employee Flow

1. Open the app (or use another device)
2. Login with:
   - Email: `employee@test.com`
   - Password: `employee123`
3. You should see the Employee Home screen
4. **Grant location permissions when prompted**
5. Swipe the slider to start tracking
6. Location should appear on Admin's map

## Troubleshooting

### "Firebase not configured" Error

- Check that `src/config/constants.ts` has your Firebase config
- Restart the dev server

### Map not showing on Android

- Verify Google Maps API key in `app.json`
- Ensure Maps SDK for Android is enabled

### Location permissions denied

- Go to device Settings → Apps → Location Tracker
- Enable all location permissions
- For Android, enable "Allow all the time"

### Background tracking not working in Expo Go

- Build a development build:
  ```bash
  npx expo run:android
  # or
  npx expo run:ios
  ```

## Next Steps

1. **Customize Design:**

   - Edit colors in `src/theme/colors.ts`
   - Adjust spacing in `src/theme/spacing.ts`

2. **Add More Features:**

   - Route history visualization
   - Geofencing
   - Notifications
   - Reports generation

3. **Deploy:**
   ```bash
   # Build for production
   npx expo build:android
   npx expo build:ios
   ```

## Support

If you encounter issues:

1. Check the main README.md
2. Review Firebase and Expo documentation
3. Check console logs for errors

---

Happy tracking! 🎯
