import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export type ZaraState = 'happy' | 'thinking' | 'sad' | 'thirsty' | 'idle';

export interface ZaraWidgetProps {
  state?: ZaraState;
  size?: number;
  showLabel?: boolean;
}

const ZARA_EMOJIS: Record<ZaraState, string> = {
  happy: '😊', thinking: '🤔', sad: '😢', thirsty: '😅', idle: '🌿',
};

const ZARA_COLORS: Record<ZaraState, string> = {
  happy: 'rgba(74,222,128,0.15)', thinking: 'rgba(148,163,184,0.15)',
  sad: 'rgba(186,26,26,0.1)', thirsty: 'rgba(234,179,8,0.15)', idle: 'rgba(34,197,94,0.1)',
};

export default function ZaraWidget({ state = 'idle', size = 64, showLabel = false }: ZaraWidgetProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true, easing: Easing.ease }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.ease }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: ZARA_COLORS[state] },
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Text style={{ fontSize: size * 0.5 }}>{ZARA_EMOJIS[state]}</Text>
      </Animated.View>
      {showLabel && <Text style={styles.label}>Zara</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '700', color: '#14532D', marginTop: 4 },
});
