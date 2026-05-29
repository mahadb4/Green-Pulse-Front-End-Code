import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export interface ParentDashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  onPress?: () => void;
  accentColor?: string;
}

export default function ParentDashboardCard({
  title, value, icon, subtitle, onPress, accentColor = '#14532D',
}: ParentDashboardCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.82 : 1}>
      <View style={[styles.iconCircle, { backgroundColor: `${accentColor}18` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 24,
    padding: 20, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,1)',
    ...Platform.select({
      web: { backdropFilter: 'blur(16px)', boxShadow: '0 4px 16px rgba(22,163,74,0.08)' },
      default: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    }),
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  icon: { fontSize: 24 },
  title: { fontSize: 12, fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, textAlign: 'center' },
  value: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2, textAlign: 'center' },
});
