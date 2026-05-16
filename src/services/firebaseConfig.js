import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA5P6pLHl4PMdvGwFRai2OoT_W5uecyotw',
  authDomain: 'greenpulse-dev-63b4b.firebaseapp.com',
  projectId: 'greenpulse-dev-63b4b',
  storageBucket: 'greenpulse-dev-63b4b.firebasestorage.app',
  messagingSenderId: '936940947576',
  appId: '1:936940947576:android:7e236d22907b541fe9458d',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
