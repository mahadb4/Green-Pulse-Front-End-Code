import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Platform, ActivityIndicator } from 'react-native';

export interface DataDeletionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  childNickname?: string;
}

export default function DataDeletionModal({ visible, onClose, onConfirmDelete, childNickname }: DataDeletionModalProps) {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmation.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete();
      onClose();
    } catch (e) {
      console.error('Deletion failed:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.icon}>🗑️</Text>
          <Text style={styles.title}>Delete All Data</Text>
          <Text style={styles.message}>
            This will permanently delete all data for{childNickname ? ` @${childNickname}` : ' this child'},
            including their profile, eco-actions, and reward history. This cannot be undone.
          </Text>
          <Text style={styles.confirmLabel}>Type DELETE to confirm:</Text>
          <TextInput
            style={styles.input}
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder="DELETE"
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isDeleting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteBtn, !isConfirmed && styles.deleteBtnDisabled]}
              onPress={handleDelete}
              disabled={!isConfirmed || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: {
    backgroundColor: '#FFFFFF', borderRadius: 28, padding: 28, alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
    }),
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#DC2626', marginBottom: 8 },
  message: { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  confirmLabel: { fontSize: 13, fontWeight: '700', color: '#374151', alignSelf: 'flex-start', marginBottom: 6 },
  input: {
    width: '100%', borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, fontWeight: '700',
    color: '#111827', marginBottom: 20,
  },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 999,
    borderWidth: 1.5, borderColor: '#D1D5DB', alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  deleteBtn: { flex: 1, paddingVertical: 14, borderRadius: 999, backgroundColor: '#DC2626', alignItems: 'center' },
  deleteBtnDisabled: { backgroundColor: '#FCA5A5' },
  deleteText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});
