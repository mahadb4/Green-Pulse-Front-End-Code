// actionService.ts
// Handles photo upload to Firebase Storage and calling the submitAction Cloud Function.

import { auth, db } from '../firebase';
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from 'firebase/functions';
import { getApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
  connectStorageEmulator,
} from 'firebase/storage';
import { Platform } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionType =
  | 'recycle_bottle'
  | 'plant_seed'
  | 'water_plant'
  | 'pick_litter'
  | 'compost_waste'
  | 'turn_off_light';

export interface SubmitActionResult {
  success: boolean;
  action_id: string;
  message: string;
}

export interface ActionConfig {
  label: string;
  icon: string;
  points: number;
  description: string;
}

// ─── Action Config ────────────────────────────────────────────────────────────

export const ACTION_CONFIGS: Record<ActionType, ActionConfig> = {
  recycle_bottle: { label: 'Recycle Bottle', icon: '♻️', points: 10, description: 'Place a plastic bottle in/near a recycling bin' },
  plant_seed: { label: 'Plant a Seed', icon: '🌱', points: 20, description: 'Plant a freshly planted seed or sapling in soil' },
  water_plant: { label: 'Water a Plant', icon: '💧', points: 6, description: 'Water a plant using a can, bottle, or hose' },
  pick_litter: { label: 'Pick Up Litter', icon: '🗑️', points: 15, description: 'Before/after litter pickup photo' },
  compost_waste: { label: 'Compost Waste', icon: '🌿', points: 18, description: 'Put food scraps into a compost bin' },
  turn_off_light: { label: 'Turn Off Light', icon: '💡', points: 5, description: 'Show a light switch in OFF position in an unlit room' },
};

// ─── Firebase Setup ───────────────────────────────────────────────────────────

function getFunctionsInstance() {
  const app = getApp();
  const functions = getFunctions(app, 'us-central1');
  const g = global as any;
  if (!g.__firebaseFunctionsEmulatorConnected && Platform.OS === 'web') {
    g.__firebaseFunctionsEmulatorConnected = true;
    try {
      connectFunctionsEmulator(functions, 'localhost', 5002);
      console.log('[actionService] ✅ Connected to Functions Emulator (localhost:5002)');
    } catch (e) {
      console.warn('[actionService] ⚠️ Could not connect to Functions Emulator:', e);
    }
  }
  return functions;
}

function getStorageInstance() {
  const storage = getStorage(getApp());
  const g = global as any;
  if (!g.__firebaseStorageEmulatorConnected && Platform.OS === 'web') {
    g.__firebaseStorageEmulatorConnected = true;
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('[actionService] ✅ Connected to Storage Emulator (localhost:9199)');
    } catch (e) {
      console.warn('[actionService] ⚠️ Could not connect to Storage Emulator:', e);
    }
  }
  return storage;
}

// ─── Photo Upload ─────────────────────────────────────────────────────────────

/**
 * Upload a photo to Firebase Storage and return its download URL.
 * Handles both native file URIs and web data URLs (base64).
 */
export async function uploadActionPhoto(photoUri: string): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');

  const storage = getStorageInstance();
  const photoId = Date.now().toString();
  const storagePath = `action-photos/${uid}/${photoId}.jpg`;
  const storageRef = ref(storage, storagePath);

  if (Platform.OS === 'web' || photoUri.startsWith('data:')) {
    // Web: photoUri is a base64 data URL
    await uploadString(storageRef, photoUri, 'data_url');
  } else {
    // Native: photoUri is a file:// URI
    const response = await fetch(photoUri);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  }

  const downloadUrl = await getDownloadURL(storageRef);
  console.log('[actionService] Photo uploaded:', downloadUrl);
  return downloadUrl;
}

// ─── Submit Action ────────────────────────────────────────────────────────────

/**
 * Submit an eco-action for AI verification.
 * 1. Calls the Firebase Cloud Function `submitAction`
 * 2. Returns the action_id to listen to for the AI result
 *
 * Falls back to direct Firestore write if Cloud Function is unavailable.
 */
export async function submitAction(
  actionType: ActionType,
  photoUrl: string,
  gardenId?: string
): Promise<SubmitActionResult> {
  // Ensure we have an authenticated user before proceeding
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn('[actionService] submitAction blocked: no authenticated user');
    return { success: false, action_id: '', message: 'User not authenticated' };
  }

  // Force refresh the ID token to ensure the Cloud Function receives a fresh token
  try {
    await currentUser.getIdToken(true);
  } catch (tokenErr) {
    console.warn('[actionService] Failed to refresh ID token:', tokenErr);
  }

  const uid = currentUser.uid;

  // Resolve the garden ID: use provided gardenId or fetch from child's document
  let resolvedGardenId: string | undefined = gardenId;
  if (!resolvedGardenId) {
    const childSnap = await getDoc(doc(db, 'children', uid));
    resolvedGardenId = childSnap.data()?.garden_id;
  }
  if (!resolvedGardenId) throw new Error('Garden ID not found');

  try {
    // Try calling the deployed Cloud Function first (10s timeout)
    const functions = getFunctionsInstance();
    const submitActionFn = httpsCallable(functions, 'submitAction');

    // Log details before calling the Cloud Function
    console.log('[actionService] Calling Cloud Function', {
      uid: currentUser.uid,
      hasEmail: !!currentUser.email,
      functionName: 'submitAction',
      region: 'us-central1',
    });

    const callPromise = submitActionFn({
      action_type: actionType,
      photo_url: photoUrl,
      garden_id: resolvedGardenId,
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Cloud Function call timed out after 10s')), 10000)
    );

    const result = await Promise.race([callPromise, timeoutPromise]);
    console.log('[actionService] submitAction Cloud Function result:', result.data);
    return result.data as SubmitActionResult;
  } catch (cloudFnError: any) {
    console.warn('[actionService] Cloud Function call failed, falling back:', {
      code: cloudFnError?.code,
      message: cloudFnError?.message,
      details: cloudFnError?.details,
      uid: currentUser?.uid,
    });
    console.warn('[actionService] Cloud Function unavailable. CV validation cannot run client-side.');
    return await submitActionWithRejection(actionType, photoUrl, resolvedGardenId, uid);
  }
}

/**
 * Fallback path when Cloud Functions are unreachable.
 * Creates the action document and immediately marks it as rejected because
 * real CV verification (Gemini) cannot run on the client side.
 * This prevents rewards being granted without AI validation.
 */
async function submitActionWithRejection(
  actionType: ActionType,
  photoUrl: string,
  resolvedGardenId: string,
  uid: string
): Promise<SubmitActionResult> {
  const { db } = await import('../firebase');
  const actionRef = doc(collection(db, 'actions'));

  // Helper: race a promise against a timeout so Firestore hangs never block the UI
  const withTimeout = <T>(p: Promise<T>, ms: number, label: string): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
    ]);

  try {
    // Step 1: create as 'pending' – real Firestore document
    console.log('[actionService] Fallback creating real action document');
    await withTimeout(
      setDoc(actionRef, {
        child_uid: uid,
        garden_id: resolvedGardenId,
        action_type: actionType,
        status: 'pending',
        confidence: 0,
        detected_label: null,
        photo_url: photoUrl,
        created_at: serverTimestamp(),
      }),
      5000,
      'setDoc(pending)'
    );
    console.log('[actionService] Fallback action document created, id:', actionRef.id);

    // Step 2: mark as 'rejected' with reason
    await withTimeout(
      updateDoc(actionRef, {
        status: 'rejected',
        rejection_reason: 'Cloud Function unavailable',
        processed_at: serverTimestamp(),
      }),
      5000,
      'updateDoc(rejected)'
    );
    console.log('[actionService] Fallback action rejected');
  } catch (fsErr: any) {
    // Firestore is offline — return failure without a fake ID
    console.warn('[actionService] Firestore unreachable in fallback path:', fsErr?.message);
    return { success: false, action_id: '', message: 'Verification service is currently unavailable. Please try again later.' };
  }

  // Return the real action ID even though the verification failed
  return { success: false, action_id: actionRef.id, message: 'Verification service is currently unavailable. Please try again later.' };
}

// ─── Simulation Helpers ───────────────────────────────────────────────────────

const POINTS_MAP: Record<ActionType, number> = {
  recycle_bottle: 10,
  plant_seed: 20,
  water_plant: 6,
  pick_litter: 15,
  compost_waste: 18,
  turn_off_light: 5,
};

const GARDEN_DELTAS: Record<ActionType, { health: number; water: number; nutrient: number }> = {
  recycle_bottle: { health: 0, water: 0, nutrient: 5 },
  plant_seed: { health: 10, water: 0, nutrient: 0 },
  water_plant: { health: 0, water: 8, nutrient: 0 },
  pick_litter: { health: 8, water: 0, nutrient: 0 },
  compost_waste: { health: 0, water: 0, nutrient: 10 },
  turn_off_light: { health: 3, water: 0, nutrient: 0 },
};

function getGardenStage(health: number): string {
  if (health >= 80) return 'forest';
  if (health >= 60) return 'tree';
  if (health >= 40) return 'sapling';
  if (health >= 20) return 'seedling';
  return 'barren';
}

async function simulateGardenUpdate(gardenId: string, actionType: ActionType): Promise<void> {
  try {
    const { doc: firestoreDoc, getDoc: firestoreGetDoc, updateDoc: firestoreUpdateDoc } = await import('firebase/firestore');
    const { db: firestoreDb } = await import('../firebase');
    const gardenRef = firestoreDoc(firestoreDb, 'gardens', gardenId);
    const snap = await firestoreGetDoc(gardenRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const delta = GARDEN_DELTAS[actionType];
    const newHealth = Math.min(100, (data.garden_health ?? 0) + delta.health);
    const newWater = Math.min(100, (data.water_level ?? 0) + delta.water);
    const newNutrient = Math.min(100, (data.nutrient_level ?? 0) + delta.nutrient);

    await firestoreUpdateDoc(gardenRef, {
      garden_health: newHealth,
      water_level: newWater,
      nutrient_level: newNutrient,
      garden_stage: getGardenStage(newHealth),
    });
    console.log('[actionService] Garden updated for action:', actionType);
  } catch (err) {
    console.error('[actionService] simulateGardenUpdate error:', err);
  }
}

async function simulateRewardChild(uid: string, actionType: ActionType): Promise<void> {
  try {
    const { doc: firestoreDoc, getDoc: firestoreGetDoc, updateDoc: firestoreUpdateDoc, increment, serverTimestamp: firestoreServerTimestamp } = await import('firebase/firestore');
    const { db: firestoreDb } = await import('../firebase');
    const childRef = firestoreDoc(firestoreDb, 'children', uid);
    const snap = await firestoreGetDoc(childRef);
    if (!snap.exists()) return;

    const child = snap.data();
    const points = POINTS_MAP[actionType];
    const now = Date.now();
    let newStreak = 1;

    if (child.last_action_at) {
      const lastMs = child.last_action_at.toMillis ? child.last_action_at.toMillis() : now;
      const hoursSince = (now - lastMs) / (1000 * 60 * 60);
      if (hoursSince <= 24) {
        newStreak = (child.current_streak ?? 0) + 1;
      }
    }

    const multiplier = newStreak >= 3 ? 1.5 : 1.0;
    const finalPoints = Math.round(points * multiplier);

    await firestoreUpdateDoc(childRef, {
      energy_points: increment(finalPoints),
      current_streak: newStreak,
      last_action_at: firestoreServerTimestamp(),
    });

    console.log('[actionService] Child rewarded:', finalPoints, 'pts, streak:', newStreak);
  } catch (err) {
    console.error('[actionService] simulateRewardChild error:', err);
  }
}
