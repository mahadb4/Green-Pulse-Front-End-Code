/**
 * gardenService.ts
 * Real-time Firestore listeners and data helpers for GreenPulse.
 */

import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GardenStage = 'barren' | 'seedling' | 'sapling' | 'tree' | 'forest';

export interface GardenData {
  garden_health: number;
  garden_stage: GardenStage;
  water_level: number;
  nutrient_level: number;
  action_queue: string[];
  member_count: number;
  created_at: any;
}

export interface ChildData {
  energy_points: number;
  current_streak: number;
  parent_approved: boolean;
  nickname: string | null;
  nickname_lower: string | null;        // Lowercase indexed field for uniqueness queries
  garden_id: string;
  last_action_at: any;
  fcm_token: string | null;
  notifications_disabled: boolean;      // Persisted notification preference
}

export interface RewardLogEntry {
  child_uid: string;
  garden_id: string;
  action_type: string;
  points_awarded: number;
  streak: number;
  multiplier_applied: boolean;
  created_at: any;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

/**
 * Ensures garden_karachi_01 exists in Firestore.
 * Creates it with healthy starting values if it doesn't exist.
 */
export async function ensureGardenExists(gardenId: string = 'garden_karachi_01'): Promise<void> {
  try {
    const gardenRef = doc(db, 'gardens', gardenId);
    const snap = await getDoc(gardenRef);
    if (!snap.exists()) {
      await setDoc(gardenRef, {
        garden_health: 65,
        garden_stage: 'tree',
        water_level: 72,
        nutrient_level: 58,
        action_queue: [],
        member_count: 1,
        created_at: serverTimestamp(),
      });
      console.log('[gardenService] Created garden:', gardenId);
    }
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      console.warn('[gardenService] Cannot access Firestore (auth/permissions issue). Garden will use defaults.');
    } else {
      console.warn('[gardenService] ensureGardenExists error:', error.code, error.message);
    }
  }
}

// ─── Real-Time Listeners ──────────────────────────────────────────────────────

/**
 * Subscribe to a garden document in real-time.
 * Returns unsubscribe function.
 */
export function listenToGarden(
  gardenId: string,
  callback: (data: GardenData | null) => void
): Unsubscribe {
  const gardenRef = doc(db, 'gardens', gardenId);
  return onSnapshot(gardenRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as GardenData);
    } else {
      // Return mock data if document doesn't exist yet
      callback({
        garden_health: 65,
        garden_stage: 'tree',
        water_level: 72,
        nutrient_level: 58,
        action_queue: [],
        member_count: 1,
        created_at: null,
      });
    }
  }, (error) => {
    console.warn('[gardenService] listenToGarden error (using defaults):', error.code);
    // Return mock data on error so UI doesn't break
    callback({
      garden_health: 65,
      garden_stage: 'tree',
      water_level: 72,
      nutrient_level: 58,
      action_queue: [],
      member_count: 1,
      created_at: null,
    });
  });
}

/**
 * Subscribe to the current user's child document in real-time.
 * Returns unsubscribe function.
 */
export function listenToChildProfile(
  uid: string,
  callback: (data: ChildData | null) => void
): Unsubscribe {
  if (!uid) {
    console.warn('[gardenService] listenToChildProfile called with no UID');
    callback(null);
    return () => {};
  }
  const childRef = doc(db, 'children', uid);
  return onSnapshot(childRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as ChildData);
    } else {
      callback(null);
    }
  }, (error) => {
    console.warn('[gardenService] listenToChildProfile error:', error.code);
    callback(null);
  });
}


/**
 * Subscribe to a specific action document in real-time (for Zara reaction).
 */
export function listenToAction(
  actionId: string,
  callback: (data: any | null) => void
): Unsubscribe {
  const actionRef = doc(db, 'actions', actionId);
  return onSnapshot(actionRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('[gardenService] listenToAction error:', error);
    callback(null);
  });
}

// ─── One-Time Reads ───────────────────────────────────────────────────────────

/**
 * Get child profile once.
 */
export async function getChildProfile(uid: string): Promise<ChildData | null> {
  const snap = await getDoc(doc(db, 'children', uid));
  return snap.exists() ? (snap.data() as ChildData) : null;
}

/**
 * Get recent reward log entries for a child.
 */
export async function getRewardLog(uid: string, limitCount = 10): Promise<RewardLogEntry[]> {
  if (!uid) return [];
  try {
    // Simple query with only a single where clause avoids needing a composite Firestore index.
    // We sort client-side so this works even without emulator or deployed indexes.
    const q = query(
      collection(db, 'reward_log'),
      where('child_uid', '==', uid),
      limit(limitCount * 2) // fetch more to allow client-side sort + trim
    );
    const snap = await getDocs(q);
    const entries = snap.docs.map(d => d.data() as RewardLogEntry);
    // Sort by created_at descending client-side (works with Timestamp or null)
    entries.sort((a, b) => {
      const ta = a.created_at?.seconds ?? 0;
      const tb = b.created_at?.seconds ?? 0;
      return tb - ta;
    });
    return entries.slice(0, limitCount);
  } catch (error) {
    console.warn('[gardenService] getRewardLog:', error);
    return [];
  }
}

// ─── Writes ───────────────────────────────────────────────────────────────────

/**
 * Set parent_approved = true on child document.
 * Called after OTP verification.
 */
export async function approveChild(uid: string): Promise<void> {
  await setDoc(doc(db, 'children', uid), {
    parent_approved: true,
  }, { merge: true });
}

/**
 * Update child's FCM token.
 */
export async function saveFcmToken(uid: string, token: string): Promise<void> {
  await setDoc(doc(db, 'children', uid), { fcm_token: token }, { merge: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStageEmoji(stage: GardenStage): string {
  const map: Record<GardenStage, string> = {
    barren: '🏜️',
    seedling: '🌱',
    sapling: '🌿',
    tree: '🌳',
    forest: '🌲',
  };
  return map[stage] ?? '🌱';
}

export function getStageLabel(stage: GardenStage): string {
  const map: Record<GardenStage, string> = {
    barren: 'Barren Land',
    seedling: 'Seedling',
    sapling: 'Young Sapling',
    tree: 'Full Tree',
    forest: 'Lush Forest',
  };
  return map[stage] ?? 'Garden';
}

export function getHealthLabel(health: number): string {
  if (health >= 80) return 'Excellent';
  if (health >= 60) return 'Good';
  if (health >= 40) return 'Fair';
  if (health >= 20) return 'Poor';
  return 'Critical';
}
