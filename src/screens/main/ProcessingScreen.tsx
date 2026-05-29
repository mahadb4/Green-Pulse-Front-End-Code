import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { listenToAction } from '../../services/gardenService';
import { ACTION_CONFIGS, ActionType } from '../../services/actionService';
import BrandHeader from '../../components/BrandHeader';

type ActionStatus = 'pending' | 'verified' | 'rejected';

const TIPS = [
  'Did you know? Daily eco-actions increase your garden\'s growth by 15%!',
  'Streak bonuses activate at 3 consecutive days — keep it up!',
  'Water actions heal your garden when the water level is critically low.',
  'Composting gives the biggest nutrient boost to your garden soil.',
  'Planting seeds is worth 20 points — the most impactful action!',
];

export default function ProcessingScreen({ navigation, route }: any) {
  const { actionId, actionType, points = 10 } = route.params || {};
  const [status, setStatus] = useState<ActionStatus>('pending');
  const [actionData, setActionData] = useState<any>(null);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  // Guard: prevent any navigation or state update after we've already navigated away
  const hasNavigated = useRef(false);
  // Keep a reference to the safety timer so terminal handlers can cancel it
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = actionType ? ACTION_CONFIGS[actionType as ActionType] : null;

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start rotating glow
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Heartbeat pulse for mascot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Fade in text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Centralised, guarded navigation so only ONE transition ever fires
  const navigateOnce = (screen: string, params: object) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    navigation.navigate(screen, params);
  };

  useEffect(() => {
    if (!actionId) {
      console.warn('[ProcessingScreen] submitAction failed, not listening');
      // No actionId: go straight to retry, no delay needed
      navigateOnce('ActionRetry', {
        reason: 'Invalid submission details (no action ID)',
        confidence: 0,
      });
      return;
    }

    // Safety timeout: if AI takes more than 30 s, show retry (no reward).
    safetyTimerRef.current = setTimeout(() => {
      navigateOnce('ActionRetry', {
        reason: 'Verification timed out. Please try again.',
        confidence: 0,
      });
    }, 30000);

    // Listen to the real action document in Firestore
    const unsubscribe = listenToAction(actionId, (data) => {
      if (!data || hasNavigated.current) return;

      setActionData(data);
      const newStatus = data.status as ActionStatus;
      setStatus(newStatus);

      if (newStatus === 'verified') {
        unsubscribe();
        const earnedPoints = config?.points ?? points;
        // Brief pause so user sees the "✅ Reward granted!" state
        setTimeout(() => {
          navigateOnce('ActionSuccess', {
            points: earnedPoints,
            actionType,
            confidence: data.confidence,
            detectedLabel: data.detected_label,
          });
        }, 1200);
      } else if (newStatus === 'rejected') {
        unsubscribe();
        // Do not auto-redirect; wait for user to press "Next"
      }
    });

    return () => {
      unsubscribe();
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
    };
  }, [actionId]);

  const handleNext = () => {
    if (actionData) {
      navigateOnce('ActionRetry', {
        reason: actionData.rejection_reason || 'Action could not be verified',
        confidence: actionData.confidence ?? 0,
      });
    }
  };

  const statusIcon = status === 'pending' ? '🔍' : status === 'verified' ? '✅' : '❌';
  const statusText =
    status === 'pending'
      ? 'Processing image…'
      : status === 'verified'
      ? 'Reward granted! ✨'
      : actionData?.rejection_reason?.toLowerCase().includes('confidence')
      ? 'Low confidence detection'
      : 'AI failed to recognize action';
  const subText =
    status === 'pending'
      ? 'Zara is double-checking the details. This will just take a moment.'
      : status === 'verified'
      ? 'Great job! Redirecting you to your reward…'
      : actionData?.rejection_reason || 'Could not verify the action in the image.';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />

      {/* Brand */}
      <BrandHeader transparent={true} />

      {/* Main Card */}
      <View style={styles.cardContainer}>

        {/* Top: Mascot */}
        <Animated.View style={[styles.topContent, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.mascotContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                    { scale: 1.2 },
                  ],
                },
              ]}
            />
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGBpL8XgqeRNpEh8VqvLTtLJ-mZ4f0BLGtWVpfNuNfsKnhBso2ANbImTW9yH5Q8wmvGUMWRNFLt62DBq7DFNQ5_2eOjpH71S83XZrnQTT9Db6sdI7VUFm7kbSabO9eJs3InNbnk9Z3qIkivXT3_aCBmwaH4rkkKMP8nZVxj3gQS_jHMQIfiviNaFeDD9fYVLwnI1mz-oRvxxj_YB-cqjYdpIhToag_uqku31SjBoXzpGOrWpY3TCF8QGYpGMKvPWvlwQFmGxEukHA' }}
              style={styles.mascotImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Status Icon */}
          <Text style={styles.statusIcon}>{statusIcon}</Text>
          <Text style={styles.headline}>{statusText}</Text>
          <Text style={styles.subtext}>{subText}</Text>

          {/* Action info badge — only shown while pending (not on failure) */}
          {config && status !== 'rejected' && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeIcon}>{config.icon}</Text>
              <Text style={styles.actionBadgeText}>{config.label}</Text>
              <Text style={styles.actionBadgePoints}>+{config.points}pts</Text>
            </View>
          )}
        </Animated.View>

        {/* Bottom: Progress + Tip */}
        <View style={styles.bottomContent}>
          {status === 'pending' && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color="#38ad32" />
              <Text style={styles.progressLabel}>AI Analysis in progress…</Text>
            </View>
          )}

          {actionData && actionData.confidence > 0 && (
            <View style={styles.confidenceBar}>
              <Text style={styles.confidenceLabel}>
                AI Confidence: {Math.round(actionData.confidence * 100)}%
              </Text>
              <View style={styles.confidenceTrack}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${actionData.confidence * 100}%`,
                      backgroundColor: actionData.confidence >= 0.8 ? '#38ad32' : '#E35D5D',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipLabel}>GARDEN TIP</Text>
            </View>
            <Text style={styles.tipText}>{tip}</Text>
          </View>

          {status === 'rejected' && (
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4', alignItems: 'center' },
  cardContainer: {
    flex: 1, width: '90%', maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 32, padding: 28,
    alignItems: 'center', marginBottom: 32,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,1)',
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)', boxShadow: '0 10px 25px rgba(22,163,74,0.08)' },
      default: {
        shadowColor: '#16A34A', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
      },
    }),
  },
  topContent: { alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' },
  mascotContainer: {
    position: 'relative', width: 160, height: 160,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  glowEffect: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(148, 246, 139, 0.3)', borderRadius: 80,
  },
  mascotImage: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 4, borderColor: '#FFFFFF', zIndex: 10,
  },
  statusIcon: { fontSize: 32, marginBottom: 8 },
  headline: {
    fontSize: 24, fontWeight: '900', color: '#14532D',
    marginBottom: 8, textAlign: 'center', letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 16, color: '#166534', textAlign: 'center',
    maxWidth: 260, lineHeight: 22, opacity: 0.8, fontWeight: '500',
  },
  actionBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16,
    backgroundColor: '#e9f0e1', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, gap: 8,
  },
  actionBadgeIcon: { fontSize: 18 },
  actionBadgeText: { fontSize: 15, fontWeight: '800', color: '#14532D' },
  actionBadgePoints: {
    fontSize: 13, color: '#14532D', fontWeight: '900',
    backgroundColor: 'rgba(74,222,128,0.2)', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 12,
  },
  bottomContent: { width: '100%', alignItems: 'center', marginTop: 32 },
  progressContainer: { alignItems: 'center', marginBottom: 20 },
  progressLabel: { fontSize: 14, color: '#166534', marginTop: 10, fontWeight: '600' },
  confidenceBar: { width: '100%', marginBottom: 16 },
  confidenceLabel: { fontSize: 13, fontWeight: '800', color: '#166534', marginBottom: 6 },
  confidenceTrack: {
    width: '100%', height: 8, backgroundColor: '#EEF2EA',
    borderRadius: 4, overflow: 'hidden',
  },
  confidenceFill: { height: '100%', borderRadius: 4 },
  tipCard: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: 20, padding: 20,
    width: '100%', borderWidth: 1.5, borderColor: 'rgba(255,255,255,1)',
  },
  tipHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  tipIcon: { fontSize: 18, marginRight: 6 },
  tipLabel: { fontSize: 13, fontWeight: '900', color: '#14532D', letterSpacing: 1 },
  tipText: { fontSize: 15, color: '#166534', textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#14532D',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(20, 83, 45, 0.3)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    }),
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});
