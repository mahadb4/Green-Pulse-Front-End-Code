import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';

export interface ConfirmationSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmationSheet({
  visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, destructive = false,
}: ConfirmationSheetProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, destructive && styles.destructiveBtn]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
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
    padding: 28, paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  title: { fontSize: 20, fontWeight: '900', color: '#14532D', marginBottom: 8 },
  message: { fontSize: 15, color: '#166534', lineHeight: 22, marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 999,
    borderWidth: 1.5, borderColor: '#dee5d6', alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '700', color: '#166534' },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 999,
    backgroundColor: '#14532D', alignItems: 'center',
  },
  destructiveBtn: { backgroundColor: '#DC2626' },
  confirmText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
