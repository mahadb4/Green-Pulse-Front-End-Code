import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface EnergyPointsBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function EnergyPointsBadge({ points, size = 'md' }: EnergyPointsBadgeProps) {
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 15;
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;

  return (
    <View style={styles.badge}>
      <Text style={[styles.icon, { fontSize: iconSize }]}>⚡</Text>
      <Text style={[styles.text, { fontSize }]}>{points.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e9f0e1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  icon: { color: '#006e09' },
  text: { fontWeight: '800', color: '#006e09' },
});
