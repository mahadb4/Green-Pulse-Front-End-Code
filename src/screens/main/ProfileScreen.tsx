import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { listenToChildProfile, getRewardLog, ChildData, RewardLogEntry } from '../../services/gardenService';
import BrandHeader from '../../components/BrandHeader';

function getLevelFromPoints(points: number): number {
  return Math.floor(points / 200) + 1;
}
function getProgressPercent(points: number): number {
  return ((points % 200) / 200) * 100;
}
function getTitleFromStreak(streak: number): string {
  if (streak >= 30) return '🌲 Forest Guardian';
  if (streak >= 14) return '🌳 Tree Keeper';
  if (streak >= 7)  return '🌿 Sapling Tender';
  if (streak >= 3)  return '🌱 Seedling Starter';
  return '🌾 Eco Newcomer';
}

export default function ProfileScreen({ navigation }: any) {
  const [child, setChild] = useState<ChildData | null>(null);
  const [rewardLog, setRewardLog] = useState<RewardLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid ?? '';

  useEffect(() => {
    const unsub = listenToChildProfile(uid, (data) => {
      setChild(data);
      setLoading(false);
    });

    // Timeout fallback: stop loading after 4s regardless
    const timeout = setTimeout(() => setLoading(false), 4000);

    getRewardLog(uid).then(setRewardLog).catch(console.warn);

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [uid]);


  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006e09" />
      </View>
    );
  }

  const points = child?.energy_points ?? 0;
  const streak = child?.current_streak ?? 0;
  const nickname = child?.nickname ?? 'Eco Hero';
  const level = getLevelFromPoints(points);
  const nextLevelXp = level * 200;
  const progressPercent = getProgressPercent(points);
  const title = getTitleFromStreak(streak);
  const parentApproved = child?.parent_approved ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />

      {/* Top App Bar */}
      <BrandHeader
        style={styles.topAppBar}
        leftContent={
          <View style={styles.appBarAvatar}>
            <Text style={styles.avatarEmoji}>🌿</Text>
          </View>
        }
        rightContent={
          <TouchableOpacity style={styles.appBarIcon}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.largeAvatarContainer}>
            <View style={styles.largeAvatarCircle}>
              <Text style={styles.largeAvatarEmoji}>🌱</Text>
            </View>
            <View style={styles.stageBadge}>
              <Text style={{ fontSize: 14 }}>🪴</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>@{nickname}</Text>
            <View style={styles.titleRow}>
              <Text style={styles.profileTitle}>{title}</Text>
            </View>
            {!parentApproved && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>⏳ Awaiting parent approval</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bento Grid Stats */}
        <View style={styles.statsGrid}>
          {/* Energy Points */}
          <View style={styles.energyCard}>
            <View style={styles.energyHeader}>
              <View>
                <Text style={styles.statLabel}>ENERGY POINTS</Text>
                <View style={styles.energyValueRow}>
                  <Text style={styles.energyValue}>{points.toLocaleString()}</Text>
                  <Text style={styles.energyUnit}>XP</Text>
                </View>
              </View>
              <View style={styles.boltIconContainer}>
                <Text style={styles.boltIcon}>⚡</Text>
              </View>
            </View>
            <View style={styles.levelProgressContainer}>
              <View style={styles.levelRow}>
                <Text style={styles.levelText}>Level {level}</Text>
                <Text style={styles.levelText}>Level {level + 1} ({nextLevelXp.toLocaleString()} XP)</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={styles.statsBottomRow}>
            <View style={styles.smallStatCard}>
              <View style={[styles.smallStatIconContainer, { backgroundColor: 'rgba(244, 180, 0, 0.1)' }]}>
                <Text style={styles.smallStatIcon}>🔥</Text>
              </View>
              <Text style={styles.statLabel}>DAILY STREAK</Text>
              <View style={styles.smallStatValueRow}>
                <Text style={styles.smallStatValue}>{streak}</Text>
                <Text style={styles.smallStatUnit}>Days</Text>
              </View>
            </View>
            <View style={styles.smallStatCard}>
              <View style={[styles.smallStatIconContainer, { backgroundColor: 'rgba(148, 246, 139, 0.3)' }]}>
                <Text style={styles.smallStatIcon}>🌍</Text>
              </View>
              <Text style={styles.statLabel}>ECO ACTIONS</Text>
              <View style={styles.smallStatValueRow}>
                <Text style={styles.smallStatValue}>{rewardLog.length}</Text>
                <Text style={styles.smallStatUnit}>Done</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Streak Multiplier Info */}
        {streak >= 3 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakCardIcon}>🔥</Text>
            <View style={styles.streakCardText}>
              <Text style={styles.streakCardTitle}>Streak Bonus Active!</Text>
              <Text style={styles.streakCardDesc}>You earn 1.5× points on every action</Text>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.historyCard}>
            {rewardLog.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryIcon}>🌱</Text>
                <Text style={styles.emptyHistoryText}>No actions yet. Start logging eco-actions!</Text>
              </View>
            ) : (
              <>
                <View style={styles.timelineLine} />
                <View style={styles.timelineContent}>
                  {rewardLog.slice(0, 5).map((entry, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: '#006e09' }]} />
                      <View style={styles.timelineTextContainer}>
                        <Text style={styles.timelineItemTitle}>
                          {entry.action_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </Text>
                        <Text style={styles.timelineItemSubtitle}>
                          +{entry.points_awarded} XP
                          {entry.multiplier_applied ? ' 🔥 (1.5× bonus)' : ''}
                          {' • '}Streak: {entry.streak}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Parent Dashboard Link */}
        <TouchableOpacity
          style={styles.parentLink}
          onPress={() => navigation.navigate('ParentDashboard')}
        >
          <Text style={styles.parentLinkIcon}>🛡️</Text>
          <Text style={styles.parentLinkText}>Switch to Parent Mode</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F2' },
  loadingContainer: { flex: 1, backgroundColor: '#F6F7F2', alignItems: 'center', justifyContent: 'center' },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F6F7F2',
    zIndex: 10,
  },
  appBarAvatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: '#dee5d6',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e9f0e1',
  },
  avatarEmoji: { fontSize: 20 },
  appBarIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  largeAvatarContainer: { position: 'relative', marginBottom: 12 },
  largeAvatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#e9f0e1', borderWidth: 4, borderColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  largeAvatarEmoji: { fontSize: 40 },
  stageBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: '#94f68b', borderRadius: 16,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF', zIndex: 20,
  },
  profileInfo: { alignItems: 'center' },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#1F2A1F' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  profileTitle: { fontSize: 16, color: '#68756B' },
  pendingBadge: {
    marginTop: 8, backgroundColor: 'rgba(244, 180, 0, 0.1)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(244, 180, 0, 0.3)',
  },
  pendingText: { fontSize: 12, color: '#856000', fontWeight: '600' },
  statsGrid: { gap: 16, marginBottom: 16 },
  energyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#EEF2EA',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
    }),
  },
  energyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  statLabel: { fontSize: 12, fontWeight: 'bold', color: '#68756B', textTransform: 'uppercase', letterSpacing: 1 },
  energyValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  energyValue: { fontSize: 28, fontWeight: 'bold', color: '#006e09' },
  energyUnit: { fontSize: 14, fontWeight: 'bold', color: '#68756B', marginLeft: 6 },
  boltIconContainer: { backgroundColor: 'rgba(56, 173, 50, 0.1)', padding: 10, borderRadius: 20 },
  boltIcon: { fontSize: 20 },
  levelProgressContainer: { width: '100%' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelText: { fontSize: 11, fontWeight: 'bold', color: '#68756B', textTransform: 'uppercase', letterSpacing: 0.5 },
  progressBarBackground: { width: '100%', height: 10, backgroundColor: '#EEF2EA', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#006e09', borderRadius: 5 },
  statsBottomRow: { flexDirection: 'row', gap: 16 },
  smallStatCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: '#EEF2EA',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
    }),
  },
  smallStatIconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  smallStatIcon: { fontSize: 24 },
  smallStatValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  smallStatValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2A1F' },
  smallStatUnit: { fontSize: 14, color: '#68756B', marginLeft: 4 },
  streakCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(244, 180, 0, 0.08)',
    borderWidth: 1, borderColor: 'rgba(244, 180, 0, 0.2)',
    borderRadius: 20, padding: 16, marginBottom: 16,
  },
  streakCardIcon: { fontSize: 28, marginRight: 14 },
  streakCardText: { flex: 1 },
  streakCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2A1F' },
  streakCardDesc: { fontSize: 13, color: '#68756B', marginTop: 2 },
  sectionContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2A1F', marginBottom: 16 },
  historyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#EEF2EA', position: 'relative',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
    }),
  },
  emptyHistory: { alignItems: 'center', paddingVertical: 24 },
  emptyHistoryIcon: { fontSize: 40, marginBottom: 12 },
  emptyHistoryText: { fontSize: 15, color: '#68756B', textAlign: 'center' },
  timelineLine: {
    position: 'absolute', left: 26, top: 36, bottom: 20,
    width: 2, backgroundColor: '#dee5d6',
  },
  timelineContent: { paddingLeft: 24, paddingTop: 8, paddingBottom: 8 },
  timelineItem: { position: 'relative', marginBottom: 20 },
  timelineDot: {
    position: 'absolute', left: -24, top: 4,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: '#FFFFFF',
    transform: [{ translateX: -7 }], zIndex: 10,
  },
  timelineTextContainer: { paddingLeft: 8 },
  timelineItemTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2A1F', marginBottom: 2 },
  timelineItemSubtitle: { fontSize: 13, color: '#68756B' },
  parentLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EEF2EA', borderWidth: 1, borderColor: '#D8E1D3',
    paddingVertical: 16, borderRadius: 20, marginTop: 8,
  },
  parentLinkIcon: { fontSize: 20, marginRight: 12 },
  parentLinkText: { fontSize: 16, fontWeight: 'bold', color: '#1F2A1F' },
  signOutBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 20, marginTop: 12,
    borderWidth: 1, borderColor: 'rgba(186, 26, 26, 0.2)',
    backgroundColor: 'rgba(255, 218, 214, 0.2)',
  },
  signOutText: { fontSize: 16, fontWeight: 'bold', color: '#ba1a1a' },
});
