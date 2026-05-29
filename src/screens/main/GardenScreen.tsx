import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  listenToGarden,
  listenToChildProfile,
  ensureGardenExists,
  getHealthLabel,
  getStageEmoji,
  getStageLabel,
  NEW_WORLD_DEFAULTS,
  GardenData,
  ChildData,
} from '../../services/gardenService';
import BrandHeader from '../../components/BrandHeader';

const GARDEN_HERO_IMAGES: Record<string, string> = {
  forest:   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop',
  tree:     'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop',
  sapling:  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop',
  seedling: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&auto=format&fit=crop',
  barren:   'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600&auto=format&fit=crop',
};

export default function GardenScreen({ navigation }: any) {
  const [garden, setGarden] = useState<GardenData>({ ...NEW_WORLD_DEFAULTS, garden_health: 0, garden_stage: 'barren' });
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  // Animations
  const heroScale = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Ambient pulsing for CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();

    // Floating effect for hero badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    // Fetch the logged‑in user's UID and child document to get the garden ID
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn('No authenticated user – cannot load garden');
      setLoading(false);
      return;
    }

    // Async init to fetch child and then set up listeners
    let unsubGarden: (() => void) | null = null;
    let unsubChild: (() => void) | null = null;
    const init = async () => {
      try {
        // Get child document to read garden_id
        const childSnap = await getDoc(doc(db, 'children', uid));
        const childData = childSnap.exists() ? (childSnap.data() as any) : null;
        setChild(childData);
        const gardenId = childData?.garden_id;
        if (!gardenId) {
          console.warn('Child profile missing garden_id');
          setLoading(false);
          return;
        }
        // Ensure garden exists (best‑effort)
        await ensureGardenExists(gardenId).catch(console.warn);
        // Listen to garden updates
        unsubGarden = listenToGarden(gardenId, (data) => {
          if (data) setGarden(data);
          setLoading(false);
        });
        // Listen to child profile for live updates
        unsubChild = listenToChildProfile(uid, setChild);
      } catch (e) {
        console.warn('Error initializing garden screen:', e);
        setLoading(false);
      }
    };
    init();

    return () => {
      if (unsubGarden) unsubGarden();
      if (unsubChild) unsubChild();
    };
  }, []);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006e09" />
        <Text style={styles.loadingText}>Loading your garden...</Text>
      </View>
    );
  }

  const stage = garden?.garden_stage ?? 'seedling';
  const health = garden?.garden_health ?? 0;
  const waterLevel = garden?.water_level ?? 0;
  const nutrientLevel = garden?.nutrient_level ?? 0;
  const isHealthy = health >= 40;
  const heroImage = GARDEN_HERO_IMAGES[stage] ?? GARDEN_HERO_IMAGES['seedling'];
  const stageLabel = getStageLabel(stage);
  const stageEmoji = getStageEmoji(stage);
  const healthLabel = getHealthLabel(health);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />

      {/* Unified Header */}
      <BrandHeader
        style={styles.topAppBar}
        transparent={true}
        rightContent={
          <View style={styles.appBarRight}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsIcon}>⚡</Text>
              <Text style={styles.pointsText}>{child?.energy_points ?? 0}</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: heroScale }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.heroSection}
            onPress={() => navigation.navigate('Actions')}
          >
            <Image
              source={{ uri: heroImage }}
              style={[styles.heroBgImage, !isHealthy && { opacity: 0.6 }]}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Animated.View style={[styles.aiPill, { transform: [{ translateY: floatAnim }] }]}>
                <Text style={styles.aiPillDot}>●</Text>
                <Text style={styles.aiPillText}>ZARA AI ANALYSIS</Text>
              </Animated.View>

              <Animated.View style={[styles.levelBadge, !isHealthy && { backgroundColor: 'rgba(255, 218, 214, 0.95)' }]}>
                <Text style={styles.levelIcon}>{stageEmoji}</Text>
                <Text style={[styles.levelText, !isHealthy && { color: '#ba1a1a' }]}>{stageLabel}</Text>
              </Animated.View>

              <Text style={styles.heroTitle}>
                {isHealthy ? 'Your Garden\nIs Thriving 🌿' : 'Your Garden\nNeeds Love 🍂'}
              </Text>
              <Text style={styles.heroSubtitle}>Tap to open Zara AI scanner →</Text>
            </View>
            <View style={styles.heroGlowBorder} />
          </TouchableOpacity>
        </Animated.View>

        {/* Metrics Bento Grid */}
        <Animated.View style={[styles.grid, { opacity: fadeAnim }]}>
          {/* Health */}
          <View style={[styles.gridCard, !isHealthy && styles.gridCardError]}>
            <View style={[styles.iconCircle, { backgroundColor: isHealthy ? '#e9f0e1' : '#ffdad6' }]}>
              <Text style={styles.cardIcon}>{isHealthy ? '💚' : '💔'}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>HEALTH</Text>
              <Text style={[styles.cardValue, !isHealthy && { color: '#ba1a1a' }]}>{healthLabel}</Text>
              <Text style={styles.cardSubValue}>{health}/100</Text>
            </View>
          </View>

          {/* Water */}
          <View style={[styles.gridCard, waterLevel < 20 && styles.gridCardWarning]}>
            <View style={[styles.iconCircle, { backgroundColor: waterLevel < 20 ? '#fff4e5' : '#eef6f9' }]}>
              <Text style={styles.cardIcon}>💧</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>WATER LEVEL</Text>
              <Text style={[styles.cardValue, waterLevel < 20 && { color: '#E35D5D' }]}>{waterLevel}%</Text>
              {waterLevel < 20 && <Text style={styles.warningText}>⚠️ Thirsty!</Text>}
            </View>
          </View>

          {/* Nutrients (Full width) */}
          <View style={[styles.gridCard, styles.fullWidthCard]}>
            <View style={styles.nutrientLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#fcf3e8' }]}>
                <Text style={styles.cardIcon}>✨</Text>
              </View>
              <View style={styles.nutrientTextContainer}>
                <Text style={styles.cardLabel}>NUTRIENTS</Text>
                <Text style={styles.cardValue}>{nutrientLevel}%</Text>
              </View>
            </View>
            <View style={styles.barChart}>
              <View style={[styles.bar, { height: '40%', backgroundColor: '#e3ebdc' }]} />
              <View style={[styles.bar, { height: `${Math.max(20, nutrientLevel)}%`, backgroundColor: nutrientLevel > 30 ? '#b02263' : '#F4B400' }]} />
              <View style={[styles.bar, { height: '60%', backgroundColor: '#e3ebdc' }]} />
            </View>
          </View>
        </Animated.View>

        {/* Streak Banner */}
        {(child?.current_streak ?? 0) > 0 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>
              {child?.current_streak}-day streak!{' '}
              {(child?.current_streak ?? 0) >= 3 ? '1.5× points active' : `${3 - (child?.current_streak ?? 0)} more for bonus`}
            </Text>
          </View>
        )}

        {/* Community Activity */}
        <View style={styles.communitySection}>
          <View style={styles.communityTextContent}>
            <Text style={styles.communityTitle}>Community Pulse</Text>
            <Text style={styles.communityDesc}>
              {isHealthy ? 'Your local squad is crushing it! 🌟' : 'Your squad can help you recover!'}
            </Text>
          </View>
          <View style={styles.communityBadge}>
            <Text style={styles.fireIcon}>🔥</Text>
            <Text style={styles.communityBadgeText}>Network: {stage} stage</Text>
          </View>
        </View>

        {/* Quick Action CTA */}
        <Animated.View style={[styles.ctaWrapper, { transform: [{ scale: pulseAnim }], opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.85}
          >
            {/* Left icon circle */}
            <View style={styles.actionButtonIconWrap}>
              <Text style={styles.actionButtonIcon}>🤖</Text>
            </View>

            {/* Label */}
            <View style={styles.actionButtonLabelWrap}>
              <Text style={styles.actionButtonText}>Initialize Zara Scan</Text>
              <Text style={styles.actionButtonSub}>AI will verify your eco-action</Text>
            </View>

            {/* Right arrow */}
            <View style={styles.actionButtonArrowWrap}>
              <Text style={styles.actionButtonArrow}>→</Text>
            </View>
            
            {/* Inner glow effect */}
            <View style={styles.actionButtonGlow} />
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#166534',
    fontWeight: '600',
  },
  topAppBar: {
    backgroundColor: 'transparent',
  },

  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 8,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9f0e1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pointsIcon: { fontSize: 14, marginRight: 4 },
  pointsText: { fontSize: 14, fontWeight: 'bold', color: '#006e09' },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  notificationIcon: { fontSize: 20 },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroSection: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  heroBgImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(23, 29, 20, 0.45)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 24,
    width: '100%',
  },
  heroGlowBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 2, borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 24, zIndex: 10, pointerEvents: 'none',
  },
  aiPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(20, 83, 45, 0.7)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start',
    marginBottom: 8, borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.5)',
  },
  aiPillDot: { color: '#4ADE80', fontSize: 8, marginRight: 6 },
  aiPillText: { color: '#4ADE80', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(238, 242, 234, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  levelIcon: { fontSize: 16, marginRight: 6 },
  levelText: { color: '#006e09', fontSize: 14, fontWeight: 'bold' },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 42,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#A7F3D0',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    width: '47%',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
    justifyContent: 'space-between',
    minHeight: 140,
  },
  gridCardError: {
    borderColor: 'rgba(186, 26, 26, 0.3)',
    backgroundColor: '#fffaf9',
  },
  gridCardWarning: {
    borderColor: 'rgba(227, 93, 93, 0.3)',
    backgroundColor: '#fffaf9',
  },
  fullWidthCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 100,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardIcon: { fontSize: 24 },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#14532D',
  },
  cardSubValue: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    color: '#E35D5D',
    marginTop: 2,
  },
  nutrientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nutrientTextContainer: { marginLeft: 16 },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    width: 64,
    gap: 6,
  },
  bar: { flex: 1, borderRadius: 2 },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 180, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 180, 0, 0.3)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  streakIcon: { fontSize: 24, marginRight: 10 },
  streakText: { fontSize: 14, fontWeight: '800', color: '#14532D', flex: 1 },
  communitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
  },
  communityTextContent: { marginBottom: 16 },
  communityTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  communityDesc: { fontSize: 15, color: '#166534', fontWeight: '500' },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7F2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
  },
  fireIcon: { fontSize: 20, marginRight: 8 },
  communityBadgeText: { fontSize: 15, fontWeight: 'bold', color: '#1F2A1F' },
  ctaWrapper: {
    marginTop: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  actionButton: {
    backgroundColor: '#14532D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 24,
    borderRadius: 30,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.2)' },
      default: {
        shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
      },
    }),
  },
  actionButtonGlow: {
    display: 'none',
  },
  actionButtonIconWrap: {
    marginRight: 12,
  },
  actionButtonIcon: { fontSize: 20 },
  actionButtonLabelWrap: { flex: 1, zIndex: 2, justifyContent: 'center' },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  actionButtonSub: {
    color: '#A7F3D0',
    fontSize: 11,
    marginTop: 0,
    fontWeight: '600',
  },
  actionButtonArrowWrap: {
    marginLeft: 12,
  },
  actionButtonArrow: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: '900',
  },
});
