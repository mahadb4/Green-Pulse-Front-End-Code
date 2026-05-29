import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface NotificationBannerProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onDismiss?: () => void;
}

const COLORS = {
  info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', icon: 'ℹ️' },
  success: { bg: '#F0FFF4', border: '#BBF7D0', text: '#14532D', icon: '✅' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: '⚠️' },
  error: { bg: '#FFF1F2', border: '#FECDD3', text: '#991B1B', icon: '❌' },
};

export default function NotificationBanner({ type, message, onDismiss }: NotificationBannerProps) {
  const c = COLORS[type];
  return (
    <View style={[styles.banner, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={styles.icon}>{c.icon}</Text>
      <Text style={[styles.message, { color: c.text }]} numberOfLines={2}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismiss}>
          <Text style={[styles.dismissText, { color: c.text }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
  },
  icon: { fontSize: 16, marginRight: 8 },
  message: { flex: 1, fontSize: 14, fontWeight: '600' },
  dismiss: { padding: 4 },
  dismissText: { fontSize: 14, fontWeight: '800' },
});
