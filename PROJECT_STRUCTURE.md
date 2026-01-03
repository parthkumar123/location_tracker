# 📁 Project Structure

```
location_tracker/
│
├── 📱 App.tsx                          # Root component with auth state management
├── 📄 app.json                         # Expo configuration with permissions
├── 🔧 babel.config.js                  # Babel config for Reanimated
├── 📦 package.json                     # Dependencies and scripts
├── 🔑 .env.example                     # Environment variables template
│
├── 📚 Documentation
│   ├── README.md                       # Main documentation
│   ├── SETUP.md                        # Step-by-step setup guide
│   ├── FEATURES.md                     # Features checklist
│   └── PROJECT_STRUCTURE.md            # This file
│
├── 🎨 src/
│   │
│   ├── 🧩 components/                  # Reusable UI Components
│   │   ├── GlassCard.tsx              # Frosted glass container
│   │   ├── GlassButton.tsx            # Gradient button with glow
│   │   ├── GlassInput.tsx             # Floating label input
│   │   ├── PulsingDot.tsx             # Animated status indicator
│   │   ├── SwipeToConfirm.tsx         # Custom swipe slider
│   │   ├── ErrorBoundary.tsx          # Error handling wrapper
│   │   ├── PermissionDenied.tsx       # Permission error screen
│   │   └── index.ts                   # Component exports
│   │
│   ├── 📱 screens/                     # Main Application Screens
│   │   ├── LoginScreen.tsx            # Authentication screen
│   │   │   └── Features:
│   │   │       • Animated gradient background
│   │   │       • Glass form inputs
│   │   │       • Neon orb animations
│   │   │       • Email/Password login
│   │   │
│   │   ├── EmployeeHome.tsx           # Employee dashboard
│   │   │   └── Features:
│   │   │       • Status card with breathing animation
│   │   │       • Swipe-to-confirm toggle
│   │   │       • Stats cards (Hours, Distance, Battery)
│   │   │       • Location tracking controls
│   │   │
│   │   ├── AdminDashboard.tsx         # Admin control panel
│   │   │   └── Features:
│   │   │       • Full-screen interactive map
│   │   │       • Floating bottom sheet
│   │   │       • Employee list with status
│   │   │       • Real-time location updates
│   │   │       • Custom animated markers
│   │   │
│   │   └── index.ts                   # Screen exports
│   │
│   ├── 🎨 theme/                       # Design System
│   │   ├── colors.ts                  # Color palette
│   │   │   └── Contains:
│   │   │       • Background colors
│   │   │       • Neon accents (Cyan, Purple, Pink)
│   │   │       • Status colors
│   │   │       • Glass effect colors
│   │   │       • Gradient definitions
│   │   │
│   │   ├── typography.ts              # Font styles
│   │   │   └── Contains:
│   │   │       • Font families
│   │   │       • Font sizes (xs to 5xl)
│   │   │       • Font weights
│   │   │       • Letter spacing
│   │   │
│   │   ├── spacing.ts                 # Spacing scale
│   │   │   └── Contains:
│   │   │       • xs, sm, md, lg, xl, 2xl, 3xl
│   │   │
│   │   └── index.ts                   # Theme exports
│   │       └── Contains:
│   │           • Border radius scale
│   │           • Shadow definitions
│   │           • Glow effects
│   │
│   ├── 🔧 services/                    # Business Logic Layer
│   │   ├── firebase.ts                # Firebase initialization
│   │   │   └── Exports:
│   │   │       • auth: Firebase Auth instance
│   │   │       • db: Firestore instance
│   │   │
│   │   ├── auth.ts                    # Authentication service
│   │   │   └── Functions:
│   │   │       • signIn(email, password)
│   │   │       • signUp(email, password, name, role)
│   │   │       • signOut()
│   │   │       • getCurrentUser()
│   │   │       • onAuthStateChange(callback)
│   │   │
│   │   └── location.ts                # Location tracking service
│   │       └── Functions:
│   │           • requestPermissions()
│   │           • startTracking(userId)
│   │           • stopTracking()
│   │           • isTracking()
│   │           • getCurrentLocation()
│   │           • getLatestLocation(userId)
│   │           • getAllLatestLocations()
│   │
│   ├── ⚙️ config/                      # Configuration Files
│   │   └── constants.ts               # App constants
│   │       └── Contains:
│   │           • Firebase config
│   │           • Dark map style JSON
│   │           • API endpoints
│   │
│   ├── 🏷️ types/                       # TypeScript Definitions
│   │   └── index.ts                   # Type definitions
│   │       └── Types:
│   │           • User
│   │           • Location
│   │           • TrackingStats
│   │           • EmployeeStatus
│   │
│   └── 🪝 hooks/                       # Custom React Hooks
│       └── (Ready for future hooks)
│
├── 🖼️ assets/                          # Static Assets
│   ├── icon.png                       # App icon
│   ├── splash-icon.png                # Splash screen
│   ├── adaptive-icon.png              # Android adaptive icon
│   └── favicon.png                    # Web favicon
│
└── 📦 node_modules/                    # Dependencies
    └── (Generated by npm)
```

## 📊 Component Hierarchy

```
App
└── ErrorBoundary
    └── GestureHandlerRootView
        ├── LoginScreen
        │   ├── GlassCard
        │   │   ├── GlassInput (email)
        │   │   ├── GlassInput (password)
        │   │   └── GlassButton
        │   └── MotiView (animations)
        │
        ├── EmployeeHome (if role === 'employee')
        │   ├── SafeAreaView
        │   │   ├── Header (with logout)
        │   │   └── ScrollView
        │   │       ├── GlassCard (status)
        │   │       │   └── PulsingDot
        │   │       ├── SwipeToConfirm
        │   │       └── Stats Grid
        │   │           ├── GlassCard (Hours)
        │   │           ├── GlassCard (Distance)
        │   │           └── GlassCard (Battery)
        │   └── MotiView (animations)
        │
        └── AdminDashboard (if role === 'admin')
            ├── MapView
            │   └── Marker[] (employees)
            │       └── MotiView (pulse animation)
            ├── SafeAreaView (header)
            │   └── Logout Button
            └── BottomSheet
                └── BottomSheetFlatList
                    └── GlassCard[] (employee items)
                        ├── Employee Info
                        ├── PulsingDot
                        └── Coordinates
```

## 🔄 Data Flow

```
1. Authentication Flow:
   User Input → LoginScreen → authService.signIn()
   → Firebase Auth → Firestore users/{uid}
   → App.tsx (setUser) → Route to Dashboard

2. Location Tracking Flow (Employee):
   SwipeToConfirm → locationService.startTracking()
   → expo-task-manager → expo-location
   → Background Task → Firestore locations/
   → Real-time listener

3. Admin Monitoring Flow:
   AdminDashboard → Load Employees
   → Firestore users/ (role=employee)
   → For each: locationService.getLatestLocation()
   → Firestore locations/ → Display on Map
   → Real-time listener → Update UI

4. Real-time Updates:
   Firestore onSnapshot (locations)
   → AdminDashboard.updateEmployeeLocations()
   → Re-render markers → Animate map
```

## 🎯 Key Design Patterns

### 1. **Service Layer Pattern**

- Business logic separated from UI
- Reusable across components
- Easy to test and maintain

### 2. **Component Composition**

- Small, reusable components
- Glass components for consistent design
- Prop-based customization

### 3. **Custom Hooks (Ready)**

- Future location: `src/hooks/`
- Examples: useLocation, useTracking, useAuth

### 4. **Theme-First Design**

- Centralized design tokens
- Easy to customize
- Type-safe with TypeScript

### 5. **Error Boundaries**

- Graceful error handling
- User-friendly error screens
- No app crashes

## 📱 Screen Sizes Supported

- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- iPad (768px+)
- Android phones (360px - 412px)
- Android tablets (600px+)

## 🎨 Design System

### Glass Effect Formula

```typescript
blur: 20 intensity
background: rgba(15, 23, 42, 0.5)
border: 1px rgba(255, 255, 255, 0.1)
borderRadius: 16px
```

### Shadow/Glow Formula

```typescript
shadowColor: #06b6d4 (or #8b5cf6, #ec4899)
shadowOffset: { width: 0, height: 0 }
shadowOpacity: 0.5
shadowRadius: 10
elevation: 5
```

## 🚀 Performance Optimizations

1. **Memoization**: React.memo for heavy components
2. **Lazy Loading**: Code splitting ready
3. **Optimized Re-renders**: Proper state management
4. **Efficient Listeners**: Cleanup on unmount
5. **Image Optimization**: SVG icons (lucide)

---

This structure provides:
✅ Clear separation of concerns
✅ Easy to maintain and scale
✅ Type-safe development
✅ Reusable components
✅ Clean architecture
