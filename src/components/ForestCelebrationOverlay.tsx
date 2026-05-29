import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';

export interface ForestCelebrationOverlayProps {
  visible: boolean;
  onComplete?: () => void;
}

export default function ForestCelebrationOverlay({ visible, onComplete }: ForestCelebrationOverlayProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
            onComplete?.();
          });
        }, 2000);
      });
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.emoji}>🌲</Text>
          <Text style={styles.title}>Lush Forest!</Text>
          <Text style={styles.sub}>Your garden has reached its peak!</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,83,45,0.75)', alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 28, padding: 36 },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', color: '#14532D', marginBottom: 6 },
  sub: { fontSize: 16, color: '#166534', fontWeight: '600', textAlign: 'center' },
});
