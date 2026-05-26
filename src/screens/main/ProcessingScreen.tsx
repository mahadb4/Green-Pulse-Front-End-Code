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
        // Brief pause so user sees the "❌ AI failed" state before redirect
        setTimeout(() => {
          navigateOnce('ActionRetry', {
            reason: data.rejection_reason || 'Action could not be verified',
            confidence: data.confidence ?? 0,
          });
        }, 1500);
      }
    });

    return () => {
      unsubscribe();
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
    };
  }, [actionId]);

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
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />

      {/* Brand */}
      <BrandHeader />

      {/* Main Card */}
      <View style={styles.cardContainer}>

        {/* Top: Mascot */}
        <View style={styles.topContent}>
          <View style={styles.mascotContainer}>
            <View style={styles.glowEffect} />
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGBpL8XgqeRNpEh8VqvLTtLJ-mZ4f0BLGtWVpfNuNfsKnhBso2ANbImTW9yH5Q8wmvGUMWRNFLt62DBq7DFNQ5_2eOjpH71S83XZrnQTT9Db6sdI7VUFm7kbSabO9eJs3InNbnk9Z3qIkivXT3_aCBmwaH4rkkKMP8nZVxj3gQS_jHMQIfiviNaFeDD9fYVLwnI1mz-oRvxxj_YB-cqjYdpIhToag_uqku31SjBoXzpGOrWpY3TCF8QGYpGMKvPWvlwQFmGxEukHA' }}
              style={styles.mascotImage}
              resizeMode="cover"
            />
          </View>

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
        </View>

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
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F2', alignItems: 'center' },
  cardContainer: {
    flex: 1, width: '90%', maxWidth: 400,
    backgroundColor: '#FFFFFF', borderRadius: 32, padding: 28,
    alignItems: 'center', marginBottom: 32,
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(47, 143, 42, 0.1)' },
      default: {
        shadowColor: '#2F8F2A', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
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
    fontSize: 22, fontWeight: 'bold', color: '#1F2A1F',
    marginBottom: 8, textAlign: 'center',
  },
  subtext: {
    fontSize: 15, color: '#68756B', textAlign: 'center',
    maxWidth: 260, lineHeight: 22,
  },
  actionBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16,
    backgroundColor: '#e9f0e1', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, gap: 8,
  },
  actionBadgeIcon: { fontSize: 18 },
  actionBadgeText: { fontSize: 14, fontWeight: 'bold', color: '#1F2A1F' },
  actionBadgePoints: {
    fontSize: 13, color: '#006e09', fontWeight: 'bold',
    backgroundColor: 'rgba(0,110,9,0.1)', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 10,
  },
  bottomContent: { width: '100%', alignItems: 'center', marginTop: 32 },
  progressContainer: { alignItems: 'center', marginBottom: 20 },
  progressLabel: { fontSize: 13, color: '#68756B', marginTop: 10 },
  confidenceBar: { width: '100%', marginBottom: 16 },
  confidenceLabel: { fontSize: 13, fontWeight: 'bold', color: '#68756B', marginBottom: 6 },
  confidenceTrack: {
    width: '100%', height: 8, backgroundColor: '#EEF2EA',
    borderRadius: 4, overflow: 'hidden',
  },
  confidenceFill: { height: '100%', borderRadius: 4 },
  tipCard: {
    backgroundColor: '#EEF2EA', borderRadius: 16, padding: 16,
    width: '100%', borderWidth: 1, borderColor: 'rgba(216, 225, 211, 0.5)',
  },
  tipHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  tipIcon: { fontSize: 18, marginRight: 6 },
  tipLabel: { fontSize: 12, fontWeight: 'bold', color: '#68756B', letterSpacing: 1 },
  tipText: { fontSize: 14, color: '#68756B', textAlign: 'center', lineHeight: 20 },
});
