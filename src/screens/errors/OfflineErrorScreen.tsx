import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';

export default function OfflineErrorScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🌿</Text>
        <Text style={styles.headerTitle}>GreenPulse</Text>
      </View>

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
    backgroundColor: '#F6F7F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eff6e7',
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#D8E1D3',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    width: '100%',
    backgroundColor: '#006e09',
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    color: '#ffffff',
    fontSize: 18,
    marginRight: 8,
  }
});
