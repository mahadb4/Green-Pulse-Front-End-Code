import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';

export interface DailyLimitSheetProps {
  visible: boolean;
  onClose: () => void;
  actionsToday?: number;
  dailyLimit?: number;
}

export default function DailyLimitSheet({ visible, onClose, actionsToday = 0, dailyLimit = 5 }: DailyLimitSheetProps) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.icon}>🌙</Text>
          <Text style={styles.title}>Daily Limit Reached</Text>
          <Text style={styles.message}>
            You've logged {actionsToday} out of {dailyLimit} eco-actions today.{'\n'}
            Come back tomorrow to keep your streak going!
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Got It</Text>
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
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#14532D', marginBottom: 8 },
  message: { fontSize: 15, color: '#166534', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  closeBtn: { width: '100%', paddingVertical: 14, borderRadius: 999, backgroundColor: '#14532D', alignItems: 'center' },
  closeText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
