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

// --- Types for Backend Integration ---
export type LevelUpParams = {
  levelTitle: string;
  carbonOffsetKg: number;
};

export default function LevelUpScreen({ navigation, route }: any) {
  // Use mock data or route params for backend readiness
  const params: LevelUpParams = route?.params || {
    levelTitle: 'Forest Guardian Level 5',
    carbonOffsetKg: 50,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      
      {/* Decorative Background Dots (Simplified for RN) */}
      <View style={styles.backgroundPattern} />

      <View style={styles.contentWrapper}>
        {/* Wordmark Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>GreenPulse</Text>
        </View>

        {/* Celebration Modal Container */}
        <View style={styles.modalCard}>
          
          {/* Decorative Ambient Glows */}
          <View style={[styles.ambientGlow, styles.glowTopLeft]} />
          <View style={[styles.ambientGlow, styles.glowBottomRight]} />

          {/* Confetti Particles (Floating Icons) */}
          <View style={[styles.particle, styles.particle1]}>
            <Text style={{ fontSize: 24, color: 'rgba(56, 173, 50, 0.6)' }}>🌿</Text>
          </View>
          <View style={[styles.particle, styles.particle2]}>
            <Text style={{ fontSize: 20, color: 'rgba(250, 95, 156, 0.6)' }}>⭐</Text>
          </View>
          <View style={[styles.particle, styles.particle3]}>
            <Text style={{ fontSize: 28, color: 'rgba(244, 180, 0, 0.6)' }}>✨</Text>
          </View>
          <View style={[styles.particle, styles.particle4]}>
            <Text style={{ fontSize: 24, color: 'rgba(148, 246, 139, 0.8)' }}>🦋</Text>
          </View>

          {/* Hero Illustration */}
          <View style={styles.heroContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLSS_yXQArR3aQSDTIh1N2I3rCUZIHdxiVvfCwPVBQN0kAEMBYiQF9dXuMtzszgxIB8T7JB4PoDzEFKWa9yvkEgyBQbPFVZI29TxmbXUfQzf6e6_yrP43wrKTUbfwhBGQIz9NxBAKSstg1gv5EoFaGLDJgW0QynqpxbqpskOhDAA6_-luCeNrV9wnnM0UD0h8MxKq0b27Xq3-cHD2MZf-qXzL5dhqB4wecZmcej0iPCoAj4fuH6g5G3X-q-RsMe246cDhxSK3VvqA' }}
              style={styles.heroImage}
            />
            {/* Reward Badge Overlay */}
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardIcon}>🏅</Text>
              <Text style={styles.rewardText}>{params.levelTitle}</Text>
            </View>
          </View>

          {/* Typography Section */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Spectacular!</Text>
            <Text style={styles.bodyText}>
              Your garden is thriving. You've successfully offset {params.carbonOffsetKg}kg of carbon this month. Zara is proud of your green choices!
            </Text>
          </View>

          {/* Call to Action */}
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('Main')}
          >
            <Text style={styles.buttonText}>Continue Growing</Text>
            <Text style={styles.buttonIcon}>→</Text>
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
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(238, 242, 234, 0.8)', // surface-soft/80 overlay
    zIndex: 1,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  logoContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 30px rgba(56, 173, 50, 0.1)',
      },
      default: {
        shadowColor: '#38ad32',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
      },
    }),
    overflow: 'hidden',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.5, // simulate blur via opacity/soft color in RN
  },
  glowTopLeft: {
    top: -80,
    left: -80,
    backgroundColor: 'rgba(148, 246, 139, 0.3)', // secondary-container
  },
  glowBottomRight: {
    bottom: -80,
    right: -80,
    backgroundColor: 'rgba(135, 252, 119, 0.2)', // primary-fixed
  },
  particle: {
    position: 'absolute',
    zIndex: 5,
  },
  particle1: {
    top: 40,
    left: 40,
    transform: [{ rotate: '-12deg' }],
  },
  particle2: {
    top: 80,
    right: 48,
    transform: [{ rotate: '45deg' }, { scale: 0.75 }],
  },
  particle3: {
    bottom: 160,
    left: 32,
    transform: [{ rotate: '12deg' }, { scale: 1.1 }],
  },
  particle4: {
    top: '50%',
    right: 24,
    transform: [{ rotate: '-45deg' }],
  },
  heroContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 280,
    borderRadius: 24,
    overflow: 'visible', // allow badge to overflow
    marginBottom: 32,
    position: 'relative',
    zIndex: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  rewardBadge: {
    position: 'absolute',
    bottom: -16,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
    borderWidth: 1,
    borderColor: '#D8E1D3',
  },
  rewardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 10,
    paddingHorizontal: 8,
  },
  titleText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
    letterSpacing: -1,
  },
  bodyText: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    width: '100%',
    backgroundColor: '#006e09',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 110, 9, 0.2)',
      },
      default: {
        shadowColor: '#006e09',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
    zIndex: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
