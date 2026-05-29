/**
 * gardenService.ts
 * Real-time Firestore listeners and data helpers for GreenPulse.
 */

import { auth, db } from '../firebase';
import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
  runTransaction,
  increment,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GardenStage = 'barren' | 'seedling' | 'sapling' | 'tree' | 'forest';
export type WorldStage = 'wasteland' | 'polluted' | 'recovering' | 'clean' | 'eco_city';
export type WorldPhase = 'cleanup' | 'building';

export interface Building {
  id: string;
  type: string;
  x: number;
  z: number;
  placed_at?: any;
}

export interface GardenData {
  garden_health: number;
  garden_stage: GardenStage;
  water_level: number;
  nutrient_level: number;
  action_queue: string[];
  member_count: number;
  created_at: any;
  // World cleanup + city builder
  cleanliness: number;
  world_stage: WorldStage;
  phase: WorldPhase;
  buildings: Building[];
}

// Default state for a brand-new world: heavily polluted, waiting to be cleaned.
export const NEW_WORLD_DEFAULTS: GardenData = {
  garden_health: 20,
  garden_stage: 'seedling',
  water_level: 40,
  nutrient_level: 30,
  action_queue: [],
  member_count: 1,
  created_at: null,
  cleanliness: 8,
  world_stage: 'wasteland',
  phase: 'cleanup',
  buildings: [],
};

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

// ─── Building Catalog (city-builder phase) ──────────────────────────────────

export interface BuildingType {
  type: string;
  label: string;
  icon: string;
  cost: number;        // energy points
}

export const BUILDING_CATALOG: BuildingType[] = [
  { type: 'house',    label: 'Eco Home',  icon: '🏠', cost: 30 },
  { type: 'park',     label: 'Park',      icon: '🌳', cost: 20 },
  { type: 'solar',    label: 'Solar Farm',icon: '☀️', cost: 50 },
  { type: 'windmill', label: 'Windmill',  icon: '💨', cost: 60 },
];

export function getBuildingType(type: string): BuildingType | undefined {
  return BUILDING_CATALOG.find((b) => b.type === type);
}

// Legacy shared world used by the old anonymous-auth flow. Migrated to per-user.
export const LEGACY_SHARED_GARDEN = 'garden_karachi_01';

// ─── Seed Data ────────────────────────────────────────────────────────────────

/**
 * Ensures the specified garden exists in Firestore.
 * Creates it with healthy starting values if it doesn't exist.
 */
export async function ensureGardenExists(gardenId: string): Promise<void> {
  try {
    const gardenRef = doc(db, 'gardens', gardenId);
    const snap = await getDoc(gardenRef);
    if (!snap.exists()) {
      await setDoc(gardenRef, {
        ...NEW_WORLD_DEFAULTS,
        created_at: serverTimestamp(),
      });
      console.log('[gardenService] Created world:', gardenId);
    } else if (snap.data()?.cleanliness === undefined) {
      // Back-fill the world fields onto legacy gardens created before the cleanup mechanic.
      await setDoc(gardenRef, {
        cleanliness: NEW_WORLD_DEFAULTS.cleanliness,
        world_stage: NEW_WORLD_DEFAULTS.world_stage,
        phase: NEW_WORLD_DEFAULTS.phase,
        buildings: [],
      }, { merge: true });
      console.log('[gardenService] Back-filled world fields on legacy garden:', gardenId);
    }
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      console.warn('[gardenService] Cannot access Firestore (auth/permissions issue). Garden will use defaults.');
    } else {
      console.warn('[gardenService] ensureGardenExists error:', error.code, error.message);
    }
  }
}

/**
 * Guarantees the child owns a personal world (garden_{uid}).
 * Migrates anyone still pointing at the legacy shared garden, then ensures the
 * world document exists. Returns the resolved per-user gardenId.
 */
export async function ensurePersonalGarden(uid: string): Promise<string> {
  const childRef = doc(db, 'children', uid);
  let gardenId = `garden_${uid}`;
  try {
    const snap = await getDoc(childRef);
    const data = snap.exists() ? (snap.data() as any) : null;
    const current = data?.garden_id;
    if (!current || current === LEGACY_SHARED_GARDEN) {
      await setDoc(childRef, { garden_id: gardenId }, { merge: true });
      console.log('[gardenService] Assigned personal world:', gardenId);
    } else {
      gardenId = current;
    }
  } catch (e) {
    console.warn('[gardenService] ensurePersonalGarden fell back to', gardenId, e);
  }
  await ensureGardenExists(gardenId).catch(() => {});
  return gardenId;
}

export interface PlaceBuildingResult {
  success: boolean;
  message: string;
  remainingPoints?: number;
}

// A callable error whose code is a real validation failure should be shown to the
// user (not retried client-side). Only infra failures fall back to the client path.
const CALLABLE_FALLBACK_CODES = ['functions/unavailable', 'functions/internal', 'functions/deadline-exceeded'];
function isInfraFailure(code?: string): boolean {
  return !code || CALLABLE_FALLBACK_CODES.includes(code);
}
function cleanMessage(e: any, fallback: string): string {
  return (e?.message || fallback).replace(/^FirebaseError:\s*/, '');
}

/**
 * Place a building in the eco-city, spending energy points.
 * Primary path is the authoritative `placeBuilding` Cloud Function; if Functions
 * are unreachable we fall back to an equivalent client-side transaction so the
 * builder still works locally / before deploy.
 */
export async function placeBuilding(
  uid: string,
  gardenId: string,
  type: string,
  x: number,
  z: number
): Promise<PlaceBuildingResult> {
  const item = getBuildingType(type);
  if (!item) return { success: false, message: 'Unknown building type.' };

  // 1) Authoritative Cloud callable
  try {
    const fn = httpsCallable(getFunctions(getApp(), 'us-central1'), 'placeBuilding');
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej({ code: 'functions/deadline-exceeded' }), 8000));
    const res: any = await Promise.race([fn({ garden_id: gardenId, type, x, z }), timeout]);
    return { success: true, message: `${item.label} built!`, remainingPoints: res?.data?.remainingPoints };
  } catch (e: any) {
    if (!isInfraFailure(e?.code)) {
      return { success: false, message: cleanMessage(e, 'Could not place building.') };
    }
    // 2) Client-side fallback (rules permit authenticated garden + self writes)
    try {
      const remainingPoints = await runTransaction(db, async (tx) => {
        const childRef = doc(db, 'children', uid);
        const gardenRef = doc(db, 'gardens', gardenId);
        const childSnap = await tx.get(childRef);
        const gardenSnap = await tx.get(gardenRef);
        if (!childSnap.exists()) throw new Error('Profile not found.');
        if (!gardenSnap.exists()) throw new Error('World not found.');
        const child = childSnap.data() as any;
        const garden = gardenSnap.data() as any;
        if (garden.phase !== 'building') throw new Error('Fully clean your world to unlock building.');
        const points = child.energy_points ?? 0;
        if (points < item.cost) throw new Error(`Need ${item.cost}⚡ — you have ${points}⚡.`);
        const buildings: Building[] = Array.isArray(garden.buildings) ? garden.buildings : [];
        if (buildings.some((b) => b.x === x && b.z === z)) throw new Error('That spot is already taken.');
        const newBuilding: Building = {
          id: `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type, x, z, placed_at: Timestamp.now(),
        };
        tx.update(gardenRef, { buildings: [...buildings, newBuilding] });
        tx.update(childRef, { energy_points: increment(-item.cost) });
        return points - item.cost;
      });
      return { success: true, message: `${item.label} built!`, remainingPoints };
    } catch (clientErr: any) {
      return { success: false, message: cleanMessage(clientErr, 'Could not place building.') };
    }
  }
}

export interface RemoveBuildingResult {
  success: boolean;
  message: string;
  refund?: number;
}

/**
 * Remove (bulldoze) a building, refunding half its cost. Callable-first with a
 * client-side transaction fallback, mirroring placeBuilding.
 */
export async function removeBuilding(
  uid: string,
  gardenId: string,
  buildingId: string
): Promise<RemoveBuildingResult> {
  try {
    const fn = httpsCallable(getFunctions(getApp(), 'us-central1'), 'removeBuilding');
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej({ code: 'functions/deadline-exceeded' }), 8000));
    const res: any = await Promise.race([fn({ garden_id: gardenId, building_id: buildingId }), timeout]);
    return { success: true, message: 'Building removed.', refund: res?.data?.refund };
  } catch (e: any) {
    if (!isInfraFailure(e?.code)) {
      return { success: false, message: cleanMessage(e, 'Could not remove building.') };
    }
    try {
      const refund = await runTransaction(db, async (tx) => {
        const childRef = doc(db, 'children', uid);
        const gardenRef = doc(db, 'gardens', gardenId);
        const gardenSnap = await tx.get(gardenRef);
        if (!gardenSnap.exists()) throw new Error('World not found.');
        const garden = gardenSnap.data() as any;
        const buildings: Building[] = Array.isArray(garden.buildings) ? garden.buildings : [];
        const target = buildings.find((b) => b.id === buildingId);
        if (!target) throw new Error('Building not found.');
        const item = getBuildingType(target.type);
        const refundAmount = Math.floor((item?.cost ?? 0) * 0.5);
        tx.update(gardenRef, { buildings: buildings.filter((b) => b.id !== buildingId) });
        if (refundAmount > 0) tx.update(childRef, { energy_points: increment(refundAmount) });
        return refundAmount;
      });
      return { success: true, message: 'Building removed.', refund };
    } catch (clientErr: any) {
      return { success: false, message: cleanMessage(clientErr, 'Could not remove building.') };
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
      // Merge under defaults so legacy gardens missing world fields still render.
      callback({ ...NEW_WORLD_DEFAULTS, ...(snap.data() as Partial<GardenData>) } as GardenData);
    } else {
      // Return defaults if document doesn't exist yet
      callback({ ...NEW_WORLD_DEFAULTS });
    }
  }, (error) => {
    console.warn('[gardenService] listenToGarden error (using defaults):', error.code);
    // Return defaults on error so UI doesn't break
    callback({ ...NEW_WORLD_DEFAULTS });
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
  const user = auth.currentUser;
  if (!user) {
    console.warn('[gardenService] listenToAction skipped: no authenticated user');
    // If a callback is provided, signal null data (optional) – but we just return a no‑op unsubscribe
    return () => {};
  }
  console.log('[gardenService] listenToAction attaching listener', { uid: user.uid, actionId });
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

// ─── World helpers ──────────────────────────────────────────────────────────

export function getWorldStage(cleanliness: number): WorldStage {
  if (cleanliness >= 100) return 'eco_city';
  if (cleanliness >= 70) return 'clean';
  if (cleanliness >= 45) return 'recovering';
  if (cleanliness >= 20) return 'polluted';
  return 'wasteland';
}

export function getWorldStageLabel(stage: WorldStage): string {
  const map: Record<WorldStage, string> = {
    wasteland: 'Polluted Wasteland',
    polluted: 'Heavily Littered',
    recovering: 'Recovering',
    clean: 'Almost Pristine',
    eco_city: 'Eco City Unlocked',
  };
  return map[stage] ?? 'Polluted Wasteland';
}

export function getWorldStageEmoji(stage: WorldStage): string {
  const map: Record<WorldStage, string> = {
    wasteland: '🏭',
    polluted: '🗑️',
    recovering: '🌱',
    clean: '🌳',
    eco_city: '🏙️',
  };
  return map[stage] ?? '🏭';
}
