import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { initializeAuth, getAuth, Auth, browserLocalPersistence, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyCbu8RtuhTxuOwkr5bd-5g50i5JTUFCyiE",
  authDomain: "greenpulse-dev-63b4b.firebaseapp.com",
  projectId: "greenpulse-dev-63b4b",
  storageBucket: "greenpulse-dev-63b4b.firebasestorage.app",
  messagingSenderId: "936940947576",
  appId: "1:936940947576:web:cf0e74fe75571b26e9458d"
};

// Initialize Firebase safely to avoid "already-initialized" errors during Fast Refresh
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: Auth;
try {
  if (Platform.OS === 'web') {
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence
    });
  } else {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    let persistence;
    try {
      const fbAuth = require('firebase/auth');
      persistence = fbAuth.getReactNativePersistence ? fbAuth.getReactNativePersistence(AsyncStorage) : undefined;
    } catch (e) {
      console.warn('[firebase] Could not load react native persistence', e);
    }
    
    auth = initializeAuth(app, {
      persistence: persistence
    });
  }
} catch (error: any) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth };
export const db: Firestore = getFirestore(app);

// ---- Emulator configuration ----
// ONLY connect to emulators on web (localhost:8081 in browser).
// On a physical phone, "localhost" means the phone itself — not your PC —
// so emulator connections will fail and crash the app.
const g = global as any;
if (!g.__firebaseEmulatorsConnected && Platform.OS === 'web') {
  g.__firebaseEmulatorsConnected = true;
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('[firebase] ✅ Connected to local emulators (web only)');
  } catch (e) {
    console.warn('[firebase] ⚠️ Could not connect to emulators:', e);
  }
}
