import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';

interface BrandHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  style?: any;
  transparent?: boolean;
}

const HEADER_HEIGHT = 60;

export default function BrandHeader({
  showBackButton,
  onBack,
  leftContent,
  rightContent,
  style,
  transparent = false,
}: BrandHeaderProps) {
  return (
    // SafeAreaView ensures the header respects the device status bar
    <SafeAreaView style={[styles.safeArea, transparent && styles.safeAreaTransparent, style]}>
      <View style={[styles.header, transparent && styles.headerTransparent]}>
        {/* Left side: optional back button or custom left content */}
        <View style={styles.sideAreaLeft}>
          {leftContent ? (
            <View style={styles.leftSlotContent}>{leftContent}</View>
          ) : showBackButton ? (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Centered brand logo */}
        <View style={styles.centerArea}>
          <View style={styles.brandRow}>
            <Text style={styles.brandIcon}>🍃</Text>
            <Text style={styles.brandText}>GreenPulse</Text>
          </View>
        </View>

        {/* Right side: actions, badges, etc. */}
        <View style={styles.sideAreaRight}>{rightContent}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    // SafeAreaView will handle top padding; background matches header
    backgroundColor: '#F0FFF4', // updated base color to match new theme
  },
  safeAreaTransparent: {
    backgroundColor: 'transparent',
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FFF4', // updated base color
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(56, 173, 50, 0.2)', // subtle green border
    paddingHorizontal: 16,
    zIndex: 50,
    ...Platform.select({
      web: { boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  headerTransparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  leftArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftSlotContent: {
    marginRight: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8E1D3',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 18,
    color: '#006e09',
    fontWeight: '700',
    lineHeight: Platform.OS === 'android' ? 22 : undefined,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    fontSize: 24,
    marginRight: 6,
    lineHeight: Platform.OS === 'android' ? 30 : undefined,
  },
  brandText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#006e09',
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideAreaLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sideAreaRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerArea: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});