import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export interface GardenHeroCardProps {
  stage: string;
  health: number;
  imageUri: string;
  onPress?: () => void;
}

const stageEmoji: Record<string, string> = {
  forest: '🌲', tree: '🌳', sapling: '🌿', seedling: '🌱', barren: '🏜️',
};

export default function GardenHeroCard({ stage, health, imageUri, onPress }: GardenHeroCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>{stageEmoji[stage] ?? '🌱'}</Text>
          <Text style={styles.badgeText}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</Text>
        </View>
        <Text style={styles.healthText}>Health: {health}/100</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24, overflow: 'hidden', height: 200, marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
    }),
  },
  image: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,29,20,0.4)' },
  content: { position: 'absolute', bottom: 0, left: 0, padding: 20 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(238,242,234,0.95)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, alignSelf: 'flex-start', marginBottom: 8,
  },
  badgeIcon: { fontSize: 14, marginRight: 4 },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#006e09' },
  healthText: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
});
