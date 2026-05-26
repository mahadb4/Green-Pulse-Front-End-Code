import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface BrandHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  style?: any;
}

export default function BrandHeader({ showBackButton, onBack, leftContent, rightContent, style }: BrandHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {/* Left side (Back Button or Custom Left Content) */}
      <View style={styles.leftContainer}>
        {leftContent ? leftContent : (
          showBackButton && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Center (Perfectly Centered Logo) */}
      <View style={styles.centerContainer}>
        <Text style={styles.brandIcon}>🍃</Text>
        <Text style={styles.brandText}>GreenPulse</Text>
      </View>

      {/* Right side (rightContent) */}
      <View style={styles.rightContainer}>
        {rightContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 50,
  },
  leftContainer: {
    zIndex: 10,
    flex: 1,
    alignItems: 'flex-start',
  },
  rightContainer: {
    zIndex: 10,
    flex: 1,
    alignItems: 'flex-end',
  },
  centerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  brandIcon: {
    fontSize: 28,
    color: '#006e09',
    marginRight: 6,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#006e09',
    fontWeight: 'bold',
  },
});
