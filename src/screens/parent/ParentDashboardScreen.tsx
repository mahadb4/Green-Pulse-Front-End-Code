import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getApp } from 'firebase/app';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import {
  listenToChildProfile,
  getRewardLog,
  ChildData,
  RewardLogEntry,
  getStageLabel,
  getStageEmoji,
} from '../../services/gardenService';

function getLevelFromPoints(pts: number) { return Math.floor(pts / 200) + 1; }
function getTitleFromStreak(streak: number): string {
  if (streak >= 30) return '🌲 Forest Guardian';
  if (streak >= 14) return '🌳 Tree Keeper';
  if (streak >= 7)  return '🌿 Sapling Tender';
  if (streak >= 3)  return '🌱 Seedling Starter';
  return '🌾 Eco Newcomer';
}

// --- Validation helpers ---
const RESERVED = ['admin', 'greenpulse', 'support', 'system', 'root', 'null', 'undefined', 'moderator'];
function validateNickname(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 3) return 'Nickname must be at least 3 characters.';
  if (trimmed.length > 20) return 'Nickname must be 20 characters or less.';
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'Only letters, numbers, and underscores allowed.';
  if (/^_|_$/.test(trimmed)) return 'Nickname cannot start or end with an underscore.';
  if (RESERVED.includes(trimmed.toLowerCase())) return 'That nickname is reserved.';
  return '';
}

async function isNicknameUnique(nickname: string, currentUid: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'children'),
      where('nickname_lower', '==', nickname.toLowerCase())
    );
    const snap = await getDocs(q);
    // Unique if no docs found, OR the only match is our own document
    return snap.empty || (snap.size === 1 && snap.docs[0].id === currentUid);
  } catch (err) {
    console.warn('[ParentDashboard] Nickname uniqueness check failed (allowing):', err);
    return true; // Fail-open: don't block user if Firestore is unavailable
  }
}

export default function ParentDashboardScreen({ navigation }: any) {
  const [child, setChild] = useState<ChildData | null>(null);
  const [rewardLog, setRewardLog] = useState<RewardLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsDisabled, setNotificationsDisabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState('');

  const uid = auth.currentUser?.uid ?? '';
  const deletionInProgress = useRef(false);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const unsub = listenToChildProfile(uid, (data) => {
      setChild(data);
      setTempName(data?.nickname ?? '');
      setNotificationsDisabled(data?.notifications_disabled ?? false);
      setLoading(false);
    });

    const timeout = setTimeout(() => setLoading(false), 4000);

    getRewardLog(uid, 5).then(setRewardLog).catch(console.warn);

    return () => { unsub(); clearTimeout(timeout); };
  }, [uid]);

  const handleReturnToGarden = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Main');
    }
  };

  const handleEditName = () => {
    setTempName(child?.nickname ?? '');
    setNameError('');
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    const trimmed = tempName.trim();

    // Local validation
    const localErr = validateNickname(trimmed);
    if (localErr) { setNameError(localErr); return; }
    setNameError('');

    // Check for change — skip if same name
    if (trimmed.toLowerCase() === (child?.nickname ?? '').toLowerCase()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    setIsEditing(false);

    // Uniqueness check
    const unique = await isNicknameUnique(trimmed, uid);
    if (!unique) {
      setNameError('That nickname is already taken. Please choose another.');
      setIsEditing(true);
      setIsUpdating(false);
      return;
    }

    try {
      await setDoc(doc(db, 'children', uid), {
        nickname: trimmed,
        nickname_lower: trimmed.toLowerCase(),  // indexed field for uniqueness queries
      }, { merge: true });
    } catch (err) {
      console.warn('[ParentDashboard] Could not save name:', err);
      Alert.alert('Error', 'Could not update nickname. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsDisabled(value);
    try {
      await setDoc(doc(db, 'children', uid), { notifications_disabled: value }, { merge: true });
    } catch (err) {
      // Revert optimistic update on failure
      setNotificationsDisabled(!value);
      Alert.alert('Error', 'Could not update notification settings.');
    }
  };

  // ─── Delete Account ──────────────────────────────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and all eco-action data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (deletionInProgress.current) return;
    deletionInProgress.current = true;
    setIsDeleting(true);

    try {
      // Step 1: Try the Cloud Function first (handles all cleanup server-side)
      setDeleteStep('Contacting server…');
      let cloudFnSucceeded = false;

      try {
        const app = getApp();
        const functions = getFunctions(app, 'us-central1');
        const deleteAllData = httpsCallable(functions, 'deleteAllData');
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 12000)
        );
        await Promise.race([deleteAllData({}), timeoutPromise]);
        cloudFnSucceeded = true;
      } catch (fnErr: any) {
        console.warn('[ParentDashboard] deleteAllData Cloud Function failed:', fnErr?.message);
        // Cloud function failed — do client-side fallback
      }

      if (!cloudFnSucceeded) {
        // ── Client-side fallback cleanup ──
        setDeleteStep('Deleting actions…');
        try {
          const actionsQ = query(collection(db, 'actions'), where('child_uid', '==', uid));
          const actionsSnap = await getDocs(actionsQ);
          if (!actionsSnap.empty) {
            const batch = writeBatch(db);
            actionsSnap.forEach(d => batch.delete(d.ref));
            await batch.commit();
          }
        } catch (e) {
          console.warn('[ParentDashboard] Actions cleanup error (non-fatal):', e);
        }

        setDeleteStep('Deleting profile…');
        try {
          await deleteDoc(doc(db, 'children', uid));
        } catch (e) {
          console.warn('[ParentDashboard] Children doc delete error (non-fatal):', e);
        }

        setDeleteStep('Removing account…');
        const user = auth.currentUser;
        if (user) {
          try {
            await deleteUser(user);
          } catch (authErr: any) {
            if (authErr?.code === 'auth/requires-recent-login') {
              // Anonymous users can be deleted directly — this shouldn't happen,
              // but handle gracefully by signing out instead
              await signOut(auth);
            } else {
              throw authErr;
            }
          }
        }
      }

      // Deletion succeeded — navigate to Welcome
      setDeleteStep('Done!');
      // Auth state change will not fire if we used Cloud Function (auth deleted server-side),
      // so we explicitly navigate
      if (navigation && navigation.reset) {
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      }
    } catch (err: any) {
      console.error('[ParentDashboard] Delete account failed:', err);
      setIsDeleting(false);
      setDeleteStep('');
      deletionInProgress.current = false;
      Alert.alert(
        'Deletion Failed',
        err?.message ?? 'Could not delete account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006e09" />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  if (isDeleting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ba1a1a" />
        <Text style={[styles.loadingText, { color: '#ba1a1a' }]}>Deleting account…</Text>
        {!!deleteStep && (
          <Text style={[styles.loadingText, { fontSize: 13, marginTop: 4 }]}>{deleteStep}</Text>
        )}
      </View>
    );
  }

  const nickname = child?.nickname ?? 'Eco Hero';
  const points = child?.energy_points ?? 0;
  const streak = child?.current_streak ?? 0;
  const level = getLevelFromPoints(points);
  const title = getTitleFromStreak(streak);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />

      {/* Top App Bar */}
      <BrandHeader
        style={styles.topAppBar}
        leftContent={
          <TouchableOpacity style={styles.backToGardenBtn} onPress={handleReturnToGarden}>
            <Text style={styles.backIcon}>🏡</Text>
            <Text style={styles.backText}>Garden</Text>
          </TouchableOpacity>
        }
        rightContent={
          <TouchableOpacity style={styles.appBarIcon} onPress={handleSignOut}>
            <Text style={{ fontSize: 20 }}>🔓</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Parent Dashboard</Text>
          <Text style={styles.pageSubtitle}>Monitoring {nickname}'s eco journey.</Text>
        </View>

        <View style={styles.cardsContainer}>

          {/* Child Summary Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderTop}>
              <View style={styles.childInfoContainer}>
                <View style={styles.childAvatar}>
                  <Text style={{ fontSize: 32 }}>👦</Text>
                </View>
                <View style={styles.childInfoText}>
                  {isEditing ? (
                    <View>
                      <View style={[styles.editInputContainer, nameError ? { borderColor: '#ba1a1a' } : null]}>
                        <TextInput
                          style={styles.editInput}
                          value={tempName}
                          onChangeText={(t) => { setTempName(t); setNameError(''); }}
                          autoFocus
                          placeholder="Enter nickname"
                          maxLength={20}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => { setIsEditing(false); setNameError(''); }}
                          style={[styles.saveButton, { backgroundColor: '#68756B', marginLeft: 4 }]}
                        >
                          <Text style={styles.saveButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                      {!!nameError && (
                        <Text style={styles.nameError}>⚠️ {nameError}</Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.nameRow}>
                      <Text style={styles.childName}>{nickname}</Text>
                      {isUpdating && <ActivityIndicator size="small" color="#006e09" style={{ marginLeft: 8 }} />}
                    </View>
                  )}
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeIconWarning}>🔥</Text>
                      <Text style={styles.badgeText}>{streak} Day Streak</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeIconPrimary}>🌿</Text>
                      <Text style={styles.badgeText}>Level {level} — {title}</Text>
                    </View>
                  </View>
                </View>
              </View>
              {!isEditing && (
                <TouchableOpacity style={styles.editButton} onPress={handleEditName}>
                  <Text style={{ fontSize: 18, color: '#68756B' }}>✏️</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ENERGY XP</Text>
                <Text style={styles.statValue}>{points.toLocaleString()}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>STREAK</Text>
                <Text style={styles.statValue}>{streak}d</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ACTIONS</Text>
                <Text style={styles.statValue}>{rewardLog.length}</Text>
              </View>
            </View>
          </View>

          {/* Recent Eco-Actions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Actions</Text>
              <Text style={{ fontSize: 20 }}>🛡️</Text>
            </View>
            <Text style={styles.cardSubtitle}>Latest verified eco-actions.</Text>

            {rewardLog.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🌱</Text>
                <Text style={styles.emptyText}>No actions yet. Encourage {nickname} to log an eco-action!</Text>
              </View>
            ) : (
              <View style={styles.logsContainer}>
                {rewardLog.map((entry, index) => (
                  <View key={index} style={[styles.logItem, index === rewardLog.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <View style={styles.logIconContainer}>
                      <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓</Text>
                    </View>
                    <View style={styles.logTextContainer}>
                      <Text style={styles.logTitle}>
                        {entry.action_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Text>
                      <Text style={styles.logTime}>
                        +{entry.points_awarded} XP{entry.multiplier_applied ? ' 🔥 (1.5×)' : ''} · Streak {entry.streak}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Safety & Settings */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Safety & Settings</Text>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Pause Notifications</Text>
                <Text style={styles.settingDesc}>Disable all alerts for {nickname}'s device.</Text>
              </View>
              <Switch
                value={notificationsDisabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#dee5d6', true: '#38ad32' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger Zone</Text>
              <Text style={styles.dangerDesc}>
                Permanently delete this account and all associated data. This cannot be undone.
              </Text>
              <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8} onPress={handleDeleteAccount}>
                <Text style={styles.deleteButtonIcon}>🗑️</Text>
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Return to Garden */}
        <TouchableOpacity style={styles.bottomGardenBtn} onPress={handleReturnToGarden} activeOpacity={0.8}>
          <Text style={styles.bottomGardenIcon}>🏡</Text>
          <Text style={styles.bottomGardenText}>Return to Main Garden</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F2' },
  loadingContainer: { flex: 1, backgroundColor: '#F6F7F2', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#68756B' },
  topAppBar: {
    backgroundColor: '#F6F7F2', zIndex: 10,
  },
  backToGardenBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2EA',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: '#D8E1D3',
  },
  backIcon: { fontSize: 16, marginRight: 6 },
  backText: { fontSize: 14, fontWeight: 'bold', color: '#006e09' },
  appBarIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, flexGrow: 1 },
  pageHeader: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#1F2A1F', marginBottom: 4 },
  pageSubtitle: { fontSize: 16, color: '#68756B', textAlign: 'center' },
  cardsContainer: { gap: 24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    }),
  },
  cardHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  childInfoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  childAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(56, 173, 50, 0.1)', borderWidth: 2,
    borderColor: 'rgba(56, 173, 50, 0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  childInfoText: { justifyContent: 'center', flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  childName: { fontSize: 24, fontWeight: 'bold', color: '#1F2A1F' },
  editInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7F2',
    borderRadius: 12, borderWidth: 1, borderColor: '#D8E1D3',
    paddingHorizontal: 8, paddingVertical: 4, flex: 1,
  },
  editInput: { fontSize: 18, fontWeight: 'bold', color: '#1F2A1F', flex: 1, padding: 4 },
  saveButton: { backgroundColor: '#006e09', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  saveButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  nameError: { fontSize: 12, color: '#ba1a1a', marginTop: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  badge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2EA',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    borderWidth: 1, borderColor: '#D8E1D3',
  },
  badgeIconWarning: { fontSize: 12, marginRight: 4 },
  badgeIconPrimary: { fontSize: 12, marginRight: 4 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#68756B' },
  editButton: {
    padding: 10, borderRadius: 12, backgroundColor: '#E8F5E9',
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1, backgroundColor: '#EEF2EA', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(216, 225, 211, 0.5)',
  },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#68756B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#006e09' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2A1F' },
  cardSubtitle: { fontSize: 14, color: '#68756B', marginBottom: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#68756B', textAlign: 'center' },
  logsContainer: { width: '100%' },
  logItem: {
    flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(216, 225, 211, 0.4)',
  },
  logIconContainer: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  logTextContainer: { flex: 1 },
  logTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2A1F' },
  logTime: { fontSize: 12, color: '#68756B', marginTop: 2 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  settingTextContainer: { flex: 1, paddingRight: 16 },
  settingTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2A1F' },
  settingDesc: { fontSize: 14, color: '#68756B', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(216, 225, 211, 0.6)', marginVertical: 24 },
  dangerZone: { width: '100%' },
  dangerTitle: { fontSize: 16, fontWeight: 'bold', color: '#E35D5D', marginBottom: 4 },
  dangerDesc: { fontSize: 14, color: '#68756B', marginBottom: 20 },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255, 218, 214, 0.3)', paddingVertical: 14, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(186, 26, 26, 0.2)',
  },
  deleteButtonIcon: { fontSize: 18, marginRight: 8 },
  deleteButtonText: { fontSize: 16, fontWeight: 'bold', color: '#ba1a1a' },
  bottomGardenBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#006e09',
    paddingVertical: 16, borderRadius: 20, marginTop: 24, marginBottom: 20,
  },
  bottomGardenIcon: { fontSize: 20, marginRight: 12 },
  bottomGardenText: { fontSize: 16, fontWeight: 'bold', color: '#006e09' },
});
