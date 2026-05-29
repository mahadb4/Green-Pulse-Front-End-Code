import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface CameraOverlayProps {
  actionType?: string;
}

export default function CameraOverlay({ actionType }: CameraOverlayProps) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.guide}>
        <Text style={styles.guideText}>📷 Center the eco-action</Text>
        {actionType ? <Text style={styles.actionType}>{actionType.replace(/_/g, ' ')}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 120 },
  guide: {
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center',
  },
  guideText: { fontSize: 15, fontWeight: '700', color: '#14532D' },
  actionType: { fontSize: 12, color: '#166534', marginTop: 2 },
});
