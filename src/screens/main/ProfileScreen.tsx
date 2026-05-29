import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Easing,
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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
    ]).start();

    // Pulse for avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();

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
          // Navigation reset is handled by the onAuthStateChanged listener in App.tsx
          // but we also reset here as a safety net
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
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
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />

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
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Animated.View style={[styles.aiPill, { transform: [{ translateY: pulseAnim.interpolate({ inputRange: [1, 1.05], outputRange: [0, -4] }) }] }]}>
             <Text style={styles.aiPillDot}>●</Text>
             <Text style={styles.aiPillText}>ZARA AI TRACKING</Text>
          </Animated.View>

          <View style={styles.largeAvatarContainer}>
            <Animated.View style={[styles.largeAvatarCircle, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.avatarGlow} />
              <Text style={styles.largeAvatarEmoji}>🌱</Text>
            </Animated.View>
            <View style={styles.stageBadge}>
              <Text style={{ fontSize: 14 }}>🤖</Text>
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
        </Animated.View>

        {/* Bento Grid Stats */}
        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
              <Animated.View style={[styles.boltIconContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.boltIcon}>⚡</Text>
              </Animated.View>
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
        </Animated.View>

        {/* Streak Multiplier Info */}
        {streak >= 3 && (
          <Animated.View style={[styles.streakCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.streakCardIcon}>🔥</Text>
            <View style={styles.streakCardText}>
              <Text style={styles.streakCardTitle}>Streak Bonus Active!</Text>
              <Text style={styles.streakCardDesc}>You earn 1.5× points on every action</Text>
            </View>
          </Animated.View>
        )}

        {/* Recent Activity */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
        </Animated.View>

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
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  loadingContainer: { flex: 1, backgroundColor: '#F0FFF4', alignItems: 'center', justifyContent: 'center' },
  topAppBar: {
    backgroundColor: 'transparent',
  },
  appBarAvatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: '#dee5d6',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e9f0e1',
  },
  avatarEmoji: { fontSize: 20 },
  appBarIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24, paddingTop: 20, paddingBottom: 24, position: 'relative' },
  aiPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(20, 83, 45, 0.7)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.5)',
  },
  aiPillDot: { color: '#4ADE80', fontSize: 8, marginRight: 6 },
  aiPillText: { color: '#4ADE80', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  largeAvatarContainer: { position: 'relative', marginBottom: 12 },
  largeAvatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 2, borderColor: '#4ADE80',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
    backgroundColor: 'rgba(74, 222, 128, 0.2)', borderRadius: 60, zIndex: -1,
  },
  largeAvatarEmoji: { fontSize: 40 },
  stageBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: '#14532D', borderRadius: 16,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#4ADE80', zIndex: 20,
  },
  profileInfo: { alignItems: 'center' },
  profileName: { fontSize: 28, fontWeight: '900', color: '#14532D', letterSpacing: -0.5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  profileTitle: { fontSize: 15, color: '#166534', fontWeight: '500', opacity: 0.9 },
  pendingBadge: {
    marginTop: 8, backgroundColor: 'rgba(244, 180, 0, 0.1)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(244, 180, 0, 0.3)',
  },
  pendingText: { fontSize: 12, color: '#856000', fontWeight: '600' },
  statsGrid: { gap: 16, marginBottom: 16 },
  energyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
  },
  energyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  statLabel: { fontSize: 12, fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: 1 },
  energyValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  energyValue: { fontSize: 32, fontWeight: '900', color: '#14532D' },
  energyUnit: { fontSize: 14, fontWeight: '800', color: '#166534', marginLeft: 6 },
  boltIconContainer: { backgroundColor: 'rgba(74, 222, 128, 0.15)', padding: 12, borderRadius: 20 },
  boltIcon: { fontSize: 24 },
  levelProgressContainer: { width: '100%' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelText: { fontSize: 11, fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 },
  progressBarBackground: { width: '100%', height: 10, backgroundColor: 'rgba(74,222,128,0.2)', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4ADE80', borderRadius: 5, shadowColor: '#4ADE80', shadowOffset: {width:0, height:0}, shadowOpacity: 0.8, shadowRadius: 4 },
  statsBottomRow: { flexDirection: 'row', gap: 16 },
  smallStatCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
  },
  smallStatIconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  smallStatIcon: { fontSize: 28 },
  smallStatValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  smallStatValue: { fontSize: 26, fontWeight: '900', color: '#14532D' },
  smallStatUnit: { fontSize: 14, color: '#166534', marginLeft: 4, fontWeight: '600' },
  streakCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 20, marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
  },
  streakCardIcon: { fontSize: 32, marginRight: 16 },
  streakCardText: { flex: 1 },
  streakCardTitle: { fontSize: 16, fontWeight: '800', color: '#14532D' },
  streakCardDesc: { fontSize: 14, color: '#166534', marginTop: 2 },
  sectionContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#14532D', marginBottom: 16, letterSpacing: -0.5 },
  historyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    position: 'relative',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
  },
  emptyHistory: { alignItems: 'center', paddingVertical: 24 },
  emptyHistoryIcon: { fontSize: 44, marginBottom: 12 },
  emptyHistoryText: { fontSize: 16, color: '#166534', textAlign: 'center' },
  timelineLine: {
    position: 'absolute', left: 30, top: 40, bottom: 20,
    width: 2, backgroundColor: 'rgba(74,222,128,0.3)',
  },
  timelineContent: { paddingLeft: 28, paddingTop: 8, paddingBottom: 8 },
  timelineItem: { position: 'relative', marginBottom: 24 },
  timelineDot: {
    position: 'absolute', left: -29, top: 4,
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 3, borderColor: '#FFFFFF',
    transform: [{ translateX: -8 }], zIndex: 10,
  },
  timelineTextContainer: { paddingLeft: 8 },
  timelineItemTitle: { fontSize: 16, fontWeight: '800', color: '#14532D', marginBottom: 4 },
  timelineItemSubtitle: { fontSize: 14, color: '#166534', fontWeight: '500' },
  parentLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#14532D',
    height: 60, borderRadius: 30, marginTop: 8,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.2)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
    }),
  },
  parentLinkIcon: { fontSize: 22, marginRight: 12 },
  parentLinkText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  signOutBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: 999, marginTop: 12,
    borderWidth: 1, borderColor: 'rgba(220, 38, 38, 0.2)',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  signOutText: { fontSize: 16, fontWeight: '800', color: '#991B1B' },
});
