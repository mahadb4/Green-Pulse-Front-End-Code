import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';

export interface RejectionSheetProps {
  visible: boolean;
  reason?: string;
  confidence?: number;
  actionType?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export default function RejectionSheet({ visible, reason, confidence, actionType, onRetry, onClose }: RejectionSheetProps) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.icon}>❌</Text>
          <Text style={styles.title}>Action Not Verified</Text>
          <Text style={styles.reason}>{reason || 'Zara could not verify your eco-action. Please try with a clearer photo.'}</Text>
          {confidence !== undefined && confidence > 0 && (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>AI Confidence: {Math.round(confidence * 100)}%</Text>
            </View>
          )}
          <View style={styles.actions}>
            {onClose && (
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Dismiss</Text>
              </TouchableOpacity>
            )}
            {onRetry && (
              <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
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
  title: { fontSize: 22, fontWeight: '900', color: '#DC2626', marginBottom: 8 },
  reason: { fontSize: 15, color: '#374151', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  confidenceBadge: {
    backgroundColor: '#FEF2F2', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20,
  },
  confidenceText: { fontSize: 13, fontWeight: '700', color: '#991B1B' },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  closeBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 999,
    borderWidth: 1.5, borderColor: '#D1D5DB', alignItems: 'center',
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  retryBtn: { flex: 1, paddingVertical: 14, borderRadius: 999, backgroundColor: '#14532D', alignItems: 'center' },
  retryBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});
