import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface OfflineBannerProps {
  onRetry?: () => void;
}

export default function OfflineBanner({ onRetry }: OfflineBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>No internet connection</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF3C7', borderBottomWidth: 1, borderBottomColor: '#FDE68A',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  icon: { fontSize: 16, marginRight: 8 },
  text: { flex: 1, fontSize: 13, fontWeight: '600', color: '#92400E' },
  retryBtn: { backgroundColor: '#92400E', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  retryText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
