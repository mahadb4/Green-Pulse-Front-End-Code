import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { auth } from '../../firebase';
import {
  listenToGarden,
  listenToChildProfile,
  ensureGardenExists,
  getHealthLabel,
  getStageEmoji,
  getStageLabel,
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
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gardenId = 'garden_karachi_01';

    // Ensure garden document exists (best-effort)
    ensureGardenExists(gardenId).catch(console.warn);

    // Listen to garden — always sets loading to false on first callback
    const unsubGarden = listenToGarden(gardenId, (data) => {
      if (data) setGarden(data);
      setLoading(false);  // Always stop loading, even if data is null
    });

    // Listen to child profile
    const uid = auth.currentUser?.uid;
    let unsubChild: (() => void) | null = null;
    if (uid) {
      unsubChild = listenToChildProfile(uid, (data) => {
        setChild(data);
      });
    } else {
      // No user logged in, still stop loading
      setLoading(false);
    }

    return () => {
      unsubGarden();
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
      <StatusBar barStyle="dark-content" />

      {/* Unified Header */}
      <BrandHeader 
        style={styles.topAppBar}
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
            <View style={[styles.levelBadge, !isHealthy && { backgroundColor: 'rgba(255, 218, 214, 0.95)' }]}>
              <Text style={styles.levelIcon}>{stageEmoji}</Text>
              <Text style={[styles.levelText, !isHealthy && { color: '#ba1a1a' }]}>{stageLabel}</Text>
            </View>
            <Text style={styles.heroTitle}>
              {isHealthy ? 'Your Garden\nIs Thriving 🌿' : 'Your Garden\nNeeds Love 🍂'}
            </Text>
            <Text style={styles.heroSubtitle}>Tap to log an eco-action →</Text>
          </View>
        </TouchableOpacity>

        {/* Metrics Bento Grid */}
        <View style={styles.grid}>
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
        </View>

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
            <Text style={styles.communityTitle}>Community Activity</Text>
            <Text style={styles.communityDesc}>
              {isHealthy ? 'Your local squad is crushing it! 🌟' : 'Your squad can help you recover!'}
            </Text>
          </View>
          <View style={styles.communityBadge}>
            <Text style={styles.fireIcon}>🔥</Text>
            <Text style={styles.communityBadgeText}>Garden: {stage} stage</Text>
          </View>
        </View>

        {/* Quick Action CTA */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.82}
          >
            {/* Left icon circle */}
            <View style={styles.actionButtonIconWrap}>
              <Text style={styles.actionButtonIcon}>📷</Text>
            </View>

            {/* Label */}
            <View style={styles.actionButtonLabelWrap}>
              <Text style={styles.actionButtonText}>Log an Eco-Action</Text>
              <Text style={styles.actionButtonSub}>Upload a photo to earn points</Text>
            </View>

            {/* Right arrow */}
            <View style={styles.actionButtonArrowWrap}>
              <Text style={styles.actionButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#68756B',
  },
  topAppBar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(246, 247, 242, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#D8E1D3',
    zIndex: 50,
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
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(238, 242, 234, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  levelIcon: { fontSize: 16, marginRight: 6 },
  levelText: { color: '#006e09', fontSize: 14, fontWeight: 'bold' },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 40,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
    ...Platform.select({
      web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
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
    fontWeight: 'bold',
    color: '#68756B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  cardSubValue: {
    fontSize: 12,
    color: '#68756B',
    marginTop: 2,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  streakIcon: { fontSize: 20, marginRight: 10 },
  streakText: { fontSize: 14, fontWeight: 'bold', color: '#1F2A1F', flex: 1 },
  communitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  communityTextContent: { marginBottom: 16 },
  communityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
  },
  communityDesc: { fontSize: 15, color: '#68756B' },
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
    marginTop: 20,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#006e09',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    ...Platform.select({
      web: { boxShadow: '0px 6px 20px rgba(0, 110, 9, 0.30)' },
      default: {
        shadowColor: '#004d06',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.30,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  actionButtonIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  actionButtonIcon: { fontSize: 22 },
  actionButtonLabelWrap: {
    flex: 1,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.2,
  },
  actionButtonSub: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  actionButtonArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    flexShrink: 0,
  },
  actionButtonArrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
