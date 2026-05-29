import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface VPCGateBannerProps {
  status?: 'pending' | 'approved' | 'rejected';
}

export default function VPCGateBanner({ status = 'pending' }: VPCGateBannerProps) {
  const config = {
    pending:  { icon: '⏳', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', msg: 'Awaiting parent approval to unlock eco-actions.' },
    approved: { icon: '✅', bg: '#F0FFF4', border: '#BBF7D0', text: '#14532D', msg: 'Parent approved! You can now log eco-actions.' },
    rejected: { icon: '🚫', bg: '#FFF1F2', border: '#FECDD3', text: '#991B1B', msg: 'Parent approval required. Please ask your parent.' },
  }[status];

  return (
    <View style={[styles.banner, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.text, { color: config.text }]}>{config.msg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  icon: { fontSize: 18, marginRight: 10 },
  text: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
});
