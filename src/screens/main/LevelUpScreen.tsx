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
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      
      {/* Decorative Background Dots (Simplified for RN) */}
      <View style={styles.backgroundPattern} />

      <BrandHeader style={styles.header} transparent={true} />
      <View style={styles.contentWrapper}>

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
    backgroundColor: '#F0FFF4',
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
  header: {
    zIndex: 10,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)', boxShadow: '0 20px 40px rgba(22,163,74,0.1)' },
      default: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
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
    fontSize: 14,
    fontWeight: '800',
    color: '#14532D',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 10,
    paddingHorizontal: 8,
  },
  titleText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 8,
    letterSpacing: -1,
  },
  bodyText: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    opacity: 0.8,
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
      web: {
        boxShadow: '0 10px 25px rgba(20,83,45,0.3)',
      },
      default: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
    zIndex: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
