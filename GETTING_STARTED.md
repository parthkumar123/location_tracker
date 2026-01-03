# 🎯 Getting Started in 5 Minutes

The fastest way to get your Location Tracker app running!

## ⚡ Quick Start

### Step 1: Install Dependencies (30 seconds)

```bash
npm install
```

### Step 2: Configure Firebase (2 minutes)

1. **Create Firebase Project:**

   - Go to https://console.firebase.google.com/
   - Click "Add project" → Name it → Create

2. **Enable Services:**

   - **Authentication:** Click "Get started" → Enable "Email/Password"
   - **Firestore:** Click "Create database" → Test mode → Enable

3. **Get Your Config:**

   - Click gear icon → Project settings
   - Scroll to "Your apps" → Web icon
   - Copy the `firebaseConfig` object

4. **Update Your App:**
   Open `src/config/constants.ts` and paste your config:

   ```typescript
   export const firebaseConfig = {
     apiKey: "AIza...", // Your API key
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc123",
   };
   ```

### Step 3: Set Firestore Rules (1 minute)

In Firebase Console → Firestore → Rules tab:

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

Click "Publish"

### Step 4: Create Test Users (1 minute)

**In Firebase Console → Authentication:**

1. Add user: `admin@test.com` / `admin123` → Copy UID. zm6e7CzNlobQa6AUrMaFvrZ7DFh1
2. Add user: `employee@test.com` / `employee123` → Copy UID. 49FteSttzecDC3YIQFPAL1AaSlC2

**In Firebase Console → Firestore → users collection:**

1. Add document with ID = admin UID:

   ```
   uid: [admin UID]
   email: admin@test.com
   displayName: Admin User
   role: admin
   createdAt: [current timestamp]
   ```

2. Add document with ID = employee UID:
   ```
   uid: [employee UID]
   email: employee@test.com
   displayName: John Doe
   role: employee
   createdAt: [current timestamp]
   ```

### Step 5: Run the App (30 seconds)

```bash
# Start the app
npm start

# Then press:
# 'i' for iOS simulator
# 'a' for Android emulator
# Or scan QR code with Expo Go
```

## 🎉 That's It!

You should see the login screen. Try logging in with:

- **Admin:** `admin@test.com` / `admin123`
- **Employee:** `employee@test.com` / `employee123`

## 📱 For Full Functionality

Background location tracking requires a development build:

```bash
# iOS
npm run dev:ios

# Android
npm run dev:android
```

## 🗺️ Android Maps (Optional)

For Android, add Google Maps API key to `app.json`:

1. Get key from https://console.cloud.google.com/
2. Enable "Maps SDK for Android"
3. Update `app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_KEY_HERE"
       }
     }
   }
   ```

## ❓ Having Issues?

### Firebase not connecting?

- Double-check your config in `src/config/constants.ts`
- Make sure Firestore rules are published
- Restart the dev server: `npx expo start -c`

### Can't login?

- Verify users exist in Firebase Authentication
- Verify user documents exist in Firestore `users` collection
- Check that `role` field is set correctly

### Location not working?

- Grant location permissions on device
- For background tracking, use `npm run dev:ios` or `npm run dev:android`
- Expo Go has limitations with background location

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [FEATURES.md](FEATURES.md) for feature list
- Review [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for customization

---

**Need more help?** Check the detailed [SETUP.md](SETUP.md) guide.

Happy tracking! 🚀
