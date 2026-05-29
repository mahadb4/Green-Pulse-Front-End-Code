import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type GardenStage = 'barren' | 'seedling' | 'sapling' | 'tree' | 'forest';

export interface StageBadgeProps {
  stage: GardenStage;
  size?: 'sm' | 'md';
}

const STAGE_INFO: Record<GardenStage, { emoji: string; label: string; color: string }> = {
  barren:   { emoji: '🏜️', label: 'Barren',   color: '#92400E' },
  seedling: { emoji: '🌱', label: 'Seedling', color: '#166534' },
  sapling:  { emoji: '🌿', label: 'Sapling',  color: '#14532D' },
  tree:     { emoji: '🌳', label: 'Tree',     color: '#15803D' },
  forest:   { emoji: '🌲', label: 'Forest',   color: '#166534' },
};

export default function StageBadge({ stage, size = 'md' }: StageBadgeProps) {
  const info = STAGE_INFO[stage] ?? STAGE_INFO['seedling'];
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: `${info.color}18` }]}>
      <Text style={{ fontSize: isSmall ? 12 : 16 }}>{info.emoji}</Text>
      <Text style={[styles.label, { color: info.color, fontSize: isSmall ? 11 : 13 }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  label: { fontWeight: '800' },
});
