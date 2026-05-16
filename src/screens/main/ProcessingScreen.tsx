import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';

export default function ProcessingScreen({ navigation, route }: any) {
  const { points = 50 } = route.params || {};

  // Auto-navigate after "processing" is done
  useEffect(() => {
    console.log('Processing started, points:', points);
    const timer = setTimeout(() => {
      console.log('Timer finished, navigating to ActionSuccess');
      if (navigation && navigation.navigate) {
        navigation.navigate('ActionSuccess', { points });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []); // Run once on mount

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      
      {/* Brand Name */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>GreenPulse</Text>
      </View>

      {/* Main Processing Card Container */}
      <View style={styles.cardContainer}>
        
        {/* Top Content Area */}
        <View style={styles.topContent}>
          {/* Mascot Image */}
          <View style={styles.mascotContainer}>
            <View style={styles.glowEffect} />
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGBpL8XgqeRNpEh8VqvLTtLJ-mZ4f0BLGtWVpfNuNfsKnhBso2ANbImTW9yH5Q8wmvGUMWRNFLt62DBq7DFNQ5_2eOjpH71S83XZrnQTT9Db6sdI7VUFm7kbSabO9eJs3InNbnk9Z3qIkivXT3_aCBmwaH4rkkKMP8nZVxj3gQS_jHMQIfiviNaFeDD9fYVLwnI1mz-oRvxxj_YB-cqjYdpIhToag_uqku31SjBoXzpGOrWpY3TCF8QGYpGMKvPWvlwQFmGxEukHA' }}
              style={styles.mascotImage}
              resizeMode="cover"
            />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Verifying your eco action…</Text>
          
          {/* Subtext */}
          <Text style={styles.subtext}>
            Zara is double-checking the details. This will just take a moment.
          </Text>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          
          {/* Static Circular Progress Loader (Simulated with borders) */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={styles.progressIndicator} />
              <Text style={styles.progressIcon}>🌱</Text>
            </View>
          </View>

          {/* Fun Fact / Tip */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipLabel}>GARDEN TIP</Text>
            </View>
            <Text style={styles.tipText}>
              Did you know? Logging daily eco-actions increases your garden's growth rate by 15%.
            </Text>
          </View>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  cardContainer: {
    flex: 1,
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 16px rgba(47, 143, 42, 0.1)',
      },
      default: {
        shadowColor: '#2F8F2A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  topContent: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  mascotContainer: {
    position: 'relative',
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(148, 246, 139, 0.3)', // secondary-container/30
    borderRadius: 96,
  },
  mascotImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  bottomContent: {
    width: '100%',
    alignItems: 'center',
    marginTop: 48,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressTrack: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#e3ebdc', // surface-container-high
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressIndicator: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: 32, // cover half to simulate 50%
    bottom: -6,
    borderWidth: 6,
    borderColor: '#38ad32', // primary-container
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
    borderRightWidth: 0,
  },
  progressIcon: {
    fontSize: 24,
    color: '#38ad32',
  },
  tipCard: {
    backgroundColor: '#EEF2EA', // surface-soft
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#68756B',
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#68756B',
    textAlign: 'center',
    lineHeight: 20,
  }
});
