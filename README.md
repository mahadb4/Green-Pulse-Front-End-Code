# GreenPulse Frontend 🌿

A **React Native** (Expo SDK 54) mobile application for children to log eco-actions, grow a shared virtual garden, and earn energy points — all verified by AI.

## Tech Stack

| Layer      | Technology                                 | Version  |
| ---------- | ------------------------------------------ | -------- |
| Framework  | React Native                               | 0.81.5   |
| Platform   | Expo                                       | SDK 54   |
| Navigation | React Navigation (Stack + Bottom Tabs)     | 7.x      |
| Auth       | Firebase Auth (Email/Password + Anonymous) | 12.13    |
| Database   | Cloud Firestore (real-time listeners)      | 12.13    |
| Storage    | Firebase Storage (photo upload)            | 12.13    |
| Camera     | expo-camera + expo-image-picker            | 17.x     |
| Animations | React Native Animated API                  | built-in |
| Gestures   | react-native-gesture-handler               | 2.28     |

## Project Structure

```
GreenPulse-Frontend/
├── App.tsx                          ← Root component: auth listener, splash, NavigationContainer
├── index.js                         ← Entry point with ErrorBoundary wrapper
├── app.json                         ← Expo config (SDK 54, portrait, plugins)
├── package.json                     ← Dependencies and scripts
├── src/
│   ├── firebase.ts                  ← Firebase app init, Auth, Firestore, emulator config
│   ├── navigation/
│   │   ├── AppNavigator.tsx         ← Stack navigator + inline MainTabNavigator (bottom tabs)
│   │   ├── AuthNavigator.tsx        ← Pass-through (auth managed in App.tsx)
│   │   ├── MainTabNavigator.tsx     ← Pass-through (defined inline in AppNavigator)
│   │   └── ParentNavigator.tsx      ← Pass-through (handled via main stack)
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── WelcomeScreen.tsx    ← Animated brand splash → "Get Started" / "Log In"
│   │   │   ├── LoginScreen.tsx      ← Email/password sign-in via Firebase Auth
│   │   │   ├── StudentInfoScreen.tsx← Sign-up form: name, email, password → creates account + garden
│   │   │   ├── NicknameScreen.tsx   ← Unique eco-nickname (atomic Firestore transaction)
│   │   │   ├── VpcGateScreen.tsx    ← COPPA gate: "I'm the Parent" → DataReview
│   │   │   └── ZaraIntroScreen.tsx  ← AI assistant intro with typewriter animation → Main
│   │   ├── consent/
│   │   │   ├── DataReviewScreen.tsx ← Parent email input → generates 6-digit OTP
│   │   │   ├── OtpScreen.tsx        ← 6-digit OTP entry → approveChild()
│   │   │   ├── ConsentSuccessScreen.tsx ← "You're all set!" → ZaraIntro
│   │   │   └── ParentEntryScreen.tsx← Portal link to ParentDashboard
│   │   ├── main/
│   │   │   ├── GardenScreen.tsx     ← Dashboard: hero image, health/water/nutrients, streak, CTA
│   │   │   ├── CameraScreen.tsx     ← Camera viewfinder with AI scanner overlay + gallery picker
│   │   │   ├── PhotoPreviewScreen.tsx ← Preview captured/selected photo before submission
│   │   │   ├── ProcessingScreen.tsx ← Real-time Firestore listener for AI verification result
│   │   │   ├── ActionSuccessScreen.tsx ← Points earned celebration
│   │   │   ├── ActionRetryScreen.tsx← Rejection reason + retry option
│   │   │   ├── ActionDetailScreen.tsx ← Action type selection (bottom tab "Actions")
│   │   │   ├── ActionListScreen.tsx ← List of available eco-action types
│   │   │   ├── LeaderboardScreen.tsx← Community leaderboard
│   │   │   ├── ProfileScreen.tsx    ← User stats, XP, streak, reward history, sign out
│   │   │   ├── LevelUpScreen.tsx    ← Level-up celebration
│   │   │   ├── AlertsScreen.tsx     ← Notifications / alerts feed
│   │   │   └── CameraBeforeAfterScreen.tsx ← Before/after photo comparison (litter pickup)
│   │   ├── errors/
│   │   │   ├── OfflineErrorScreen.tsx
│   │   │   ├── PermissionErrorScreen.tsx
│   │   │   └── AnalysisErrorScreen.tsx
│   │   └── parent/
│   │       └── ParentDashboardScreen.tsx ← Parent oversight: child activity, consent, data deletion
│   ├── services/
│   │   ├── actionService.ts         ← Photo upload, submitAction Cloud Function call, fallback logic
│   │   ├── authService.js           ← Anonymous sign-in + child profile creation
│   │   ├── gardenService.ts         ← Real-time listeners, CRUD, helper functions
│   │   └── notificationService.js   ← Stub for FCM push registration
│   ├── components/                  ← 21 reusable UI components (see below)
│   ├── theme/
│   │   ├── colors.ts                ← Color palette (#006E1E primary, #F4F7F4 background)
│   │   ├── spacing.ts               ← Spacing tokens (xs→xl) and border radius tokens
│   │   └── typography.ts            ← Font families (Baloo2, Nunito) and size scale
│   └── utils/
│       └── styles.ts                ← Cross-platform shadow helper (web boxShadow / native shadow*)
└── assets/                          ← App icons, splash image, favicon
```

## Navigation Flow

```
Welcome (initial route)
├── StudentInfo → Nickname → VpcGate → DataReview → Otp → ConsentSuccess → ZaraIntro → Main
├── Login → ZaraIntro → Main
│
Main (Bottom Tab Navigator)
├── Garden (🏡) — Dashboard home
├── Actions (☑️) — Action type selector
├── Leaderboard (🏆) — Rankings
└── Profile (👤) — Stats, sign out, parent mode

Overlay Screens (Stack)
├── Camera → PhotoPreview → Processing → ActionSuccess | ActionRetry
├── LevelUp
├── ParentDashboard
├── Alerts
└── Error screens (Offline, Permission, Analysis)
```

## Authentication

- **Primary**: Email/password via `createUserWithEmailAndPassword` (sign-up) and `signInWithEmailAndPassword` (login)
- **Fallback**: Anonymous auth via `signInAnonymously` (used in NicknameScreen if no user)
- **State Management**: `onAuthStateChanged` in `App.tsx` listens for auth changes. On sign-out, the navigation resets to `Welcome`. On app load with an existing user, it skips to `Main`.
- **Persistence**: `getReactNativePersistence(AsyncStorage)` on native; `browserLocalPersistence` on web.

## Firebase Connection

**Config** (`src/firebase.ts`):

- Project: `greenpulse-dev-63b4b`
- Initializes Firebase App, Auth (with platform-specific persistence), and Firestore
- Emulator connections (Auth on port 9099, Firestore on 8080) only activate on `Platform.OS === 'web'`

**Cloud Functions** (`src/services/actionService.ts`):

- Calls `submitAction` callable function in `us-central1` region
- Functions Emulator (port 5002) connected on web only
- Storage Emulator (port 9199) connected on web only
- 10-second timeout on Cloud Function calls; falls back to direct Firestore write with `status: 'rejected'` if unavailable

## Components (21 total)

| Component                  | Purpose                                                                      |
| -------------------------- | ---------------------------------------------------------------------------- |
| `AnimatedBackground`       | Floating particles, gradient blobs background                                |
| `BrandHeader`              | GreenPulse brand bar with optional back button and custom left/right content |
| `TypewriterText`           | Character-by-character text reveal animation                                 |
| `ActionCard`               | Eco-action type card with icon, label, points                                |
| `CameraOverlay`            | Camera framing guide overlay                                                 |
| `ConfirmationSheet`        | Bottom sheet confirmation dialog                                             |
| `DailyLimitSheet`          | Daily action limit notification                                              |
| `DataDeletionModal`        | COPPA data deletion confirmation                                             |
| `EnergyPointsBadge`        | Points display badge                                                         |
| `ForestCelebrationOverlay` | Full-screen forest achievement celebration                                   |
| `GardenHeroCard`           | Garden stage hero display card                                               |
| `NotificationBanner`       | In-app notification banner                                                   |
| `OfflineBanner`            | Offline state indicator                                                      |
| `ParentDashboardCard`      | Parent dashboard stat card                                                   |
| `ProgressBar`              | Generic progress bar                                                         |
| `RejectionSheet`           | Action rejection explanation sheet                                           |
| `StageBadge`               | Garden stage indicator (barren→forest)                                       |
| `StreakCounter`            | Streak day counter display                                                   |
| `SuccessSheet`             | Action success celebration sheet                                             |
| `VPCGateBanner`            | Parental consent required banner                                             |
| `ZaraWidget`               | Zara AI assistant floating widget                                            |

## Design Language

- **Theme**: Premium glassmorphism with nature-inspired green palette
- **Primary Color**: `#006E1E` (CTA green), `#14532D` (deep forest green)
- **Background**: `#F0FFF4` (minty white), `#F4F7F4` (neutral off-white)
- **Card Style**: `rgba(255,255,255,0.85)` with `backdropFilter: blur(24px)` on web, native shadows
- **Animations**: Entrance fades, spring scales, pulse loops, floating effects, typewriter text
- **Typography**: Baloo2 (display/headings), Nunito (body/labels)

## Running Locally

```bash
# Install dependencies
npm install

# Start Expo dev server (tunnel mode for physical devices)
npm run start:tunnel

# Or LAN mode (same Wi-Fi network)
npm run start:lan

# Or with fixed hostname
npm run start:fix

# Run on specific platform
npm run android
npm run ios
npm run web
```

**Requirements**: Node.js ≥ 20, Expo CLI, Expo Go app on device

## Environment Notes

- Firebase config is hardcoded in `src/firebase.ts` (dev project)
- Emulators only connect on web platform to avoid crashing physical devices
- Camera permissions are requested at runtime via expo-camera
- Photo library permissions are requested via expo-image-picker
