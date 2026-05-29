import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';

export interface SuccessSheetProps {
  visible: boolean;
  points: number;
  actionType?: string;
  streak?: number;
  onContinue?: () => void;
}

export default function SuccessSheet({ visible, points, actionType, streak, onContinue }: SuccessSheetProps) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onContinue}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.icon}>🎉</Text>
          <Text style={styles.title}>Action Verified!</Text>
          <Text style={styles.subtitle}>
            {actionType ? actionType.replace(/_/g, ' ') + ' confirmed by Zara' : 'Eco-action confirmed!'}
          </Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsIcon}>⚡</Text>
            <Text style={styles.points}>+{points}</Text>
            <Text style={styles.pointsUnit}>pts</Text>
          </View>
          {streak !== undefined && streak >= 3 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak}-day streak · 1.5× bonus applied!</Text>
            </View>
          )}
          <TouchableOpacity style={styles.btn} onPress={onContinue}>
            <Text style={styles.btnText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: Platform.OS === 'ios' ? 40 : 28, alignItems: 'center',
  },
  icon: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#14532D', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#166534', textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 16 },
  pointsIcon: { fontSize: 22 },
  points: { fontSize: 48, fontWeight: '900', color: '#14532D' },
  pointsUnit: { fontSize: 18, fontWeight: '700', color: '#166534' },
  streakBadge: {
    backgroundColor: 'rgba(244,180,0,0.1)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16,
  },
  streakText: { fontSize: 13, fontWeight: '700', color: '#856000' },
  btn: { width: '100%', paddingVertical: 14, borderRadius: 999, backgroundColor: '#14532D', alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
