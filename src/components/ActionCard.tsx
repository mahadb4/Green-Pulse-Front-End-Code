import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export interface ActionCardProps {
  icon: string;
  label: string;
  points: number;
  description?: string;
  onPress?: () => void;
}

export default function ActionCard({ icon, label, points, description, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.desc}>{description}</Text> : null}
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>+{points}</Text>
        <Text style={styles.pointsUnit}>pts</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(22,163,74,0.08)' },
      default: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    }),
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#e9f0e1',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  icon: { fontSize: 24 },
  info: { flex: 1 },
  label: { fontSize: 16, fontWeight: '800', color: '#14532D' },
  desc: { fontSize: 13, color: '#166534', marginTop: 2, opacity: 0.8 },
  pointsBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  pointsText: { fontSize: 18, fontWeight: '900', color: '#14532D' },
  pointsUnit: { fontSize: 10, color: '#166534', fontWeight: '700' },
});
