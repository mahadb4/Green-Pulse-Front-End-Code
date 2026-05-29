import React from 'react';
import { View, StyleSheet } from 'react-native';

export interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export default function ProgressBar({ value, color = '#14532D', height = 8, backgroundColor = 'rgba(74,222,128,0.2)' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <View style={[styles.track, { height, backgroundColor }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: 99, overflow: 'hidden', width: '100%' },
  fill: { borderRadius: 99 },
});
