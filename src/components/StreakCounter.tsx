import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface StreakCounterProps {
  streak: number;
  showBonus?: boolean;
}

export default function StreakCounter({ streak, showBonus = true }: StreakCounterProps) {
  const bonusActive = streak >= 3;
  return (
    <View style={[styles.container, bonusActive && styles.bonusActive]}>
      <Text style={styles.fire}>🔥</Text>
      <View>
        <Text style={styles.streak}>{streak}-day streak</Text>
        {showBonus && bonusActive && (
          <Text style={styles.bonus}>1.5× points active!</Text>
        )}
        {showBonus && !bonusActive && streak > 0 && (
          <Text style={styles.tip}>{3 - streak} more for bonus</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(244,180,0,0.08)', borderWidth: 1, borderColor: 'rgba(244,180,0,0.2)',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
  },
  bonusActive: { backgroundColor: 'rgba(244,180,0,0.15)', borderColor: 'rgba(244,180,0,0.4)' },
  fire: { fontSize: 24 },
  streak: { fontSize: 15, fontWeight: '800', color: '#14532D' },
  bonus: { fontSize: 12, color: '#856000', fontWeight: '700' },
  tip: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
});
