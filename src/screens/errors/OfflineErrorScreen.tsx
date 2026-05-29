import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Platform
} from 'react-native';
import BrandHeader from '../../components/BrandHeader';

export default function OfflineErrorScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      
      {/* Header */}
      <BrandHeader style={styles.header} transparent={true} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYXvWnQQxAt2GQnTQbEG-0H87rDc-taelM3UwWUjFpeCn5Delrtixji22KpZp25AkJAvfGljlWaYPbhkrh1pigWBgOrb-ahdHo1cFXXfDRQ6RLIVHpxHiW69zOlHKf4iIYyChBVb6tcS5LkecUkITyLdNET_sFrGI8xtZLSKly-CuI5nUeCpMArSNyjtRX-LwT7FDUFT0SAfnxPnO_xZWIXy9jsjM1wtEIMKZWJjH_wlk3IhuORLVN4gLkCZmRzx9rK6ajd90BuYU' }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Overlay Gradient (simulated by a solid or semi-transparent view) */}
            <View style={styles.imageOverlay} />
            
            <View style={styles.iconBadge}>
              <Text style={{ fontSize: 40, color: '#006e09' }}>📴</Text>
            </View>
          </View>

          <Text style={styles.title}>You're Offline</Text>
          <Text style={styles.description}>
            We'll try again when internet returns. Your garden progress is safely saved locally.
          </Text>

          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.buttonIcon}>🔄</Text>
            <Text style={styles.buttonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  header: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)', boxShadow: '0 10px 25px rgba(22,163,74,0.08)' },
      default: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    }),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#EEF2EA',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)', // light blend
  },
  iconBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 280,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    backgroundColor: '#14532D',
    borderRadius: 999,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(20,83,45,0.3)' },
      default: {
        shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
      },
    }),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    color: '#ffffff',
    fontSize: 20,
    marginRight: 8,
  }
});
