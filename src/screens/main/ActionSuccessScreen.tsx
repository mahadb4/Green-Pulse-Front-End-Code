import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Animated,
  Easing
} from 'react-native';
import { ACTION_CONFIGS, ActionType } from '../../services/actionService';
import BrandHeader from '../../components/BrandHeader';
import { useEffect, useRef } from 'react';

export default function ActionSuccessScreen({ navigation, route }: any) {
  const { points = 10, actionType, confidence, detectedLabel } = route.params || {};

  const handleReturn = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Main');
    }
  };

  const actionConfig = actionType && ACTION_CONFIGS[actionType as ActionType] 
    ? ACTION_CONFIGS[actionType as ActionType] 
    : null;

  // Animations
  const bounceAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      
      {/* Ambient Background Elements */}
      <View style={styles.ambientTopLeft} />
      <View style={styles.ambientBottomRight} />
      <View style={styles.ambientCenter} />

      <BrandHeader transparent={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>

          {/* Mascot Hero Image */}
          <Animated.View style={[styles.mascotContainer, { opacity: fadeAnim, transform: [{ scale: bounceAnim }] }]}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl-dUCgnqlobtpjbLw9AMT_QYJbplMOW_xrlObp9FhKeR6OynLnIIeSaWod4h7_Omk6pExhJTvU0lC8lbzjjPk0nKgxRfewfbNJKRtQeYom2GZ35AH1kKw3G5hwhH5CMlyr72XjXyWZay_qj2vdGGnT3iUejHi9ygKVYhEJH4snOLeggBIG01bZcxi-mJilhwS7WHGQavTK4kjXzsaKGGAQ8LqksSD7EyGuZ9YJY9T2yDR50hcplg3L8lC8P__BAdnjH_LcQ4djH0' }}
              style={styles.mascotImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Text Content */}
          <Animated.View style={[styles.textSection, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Awesome Job! 🎉</Text>
            <Text style={styles.subtitle}>
              Your eco-action has been verified! Your garden is thriving thanks to you.
            </Text>
          </Animated.View>

          {/* Reward Card */}
          <Animated.View style={[styles.rewardCard, { opacity: fadeAnim, transform: [{ scale: bounceAnim }] }]}>
            <Text style={styles.rewardLabel}>REWARD UNLOCKED</Text>
            
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsIcon}>⚡</Text>
              <Text style={styles.pointsValue}>+{points}</Text>
            </View>
            <Text style={styles.pointsText}>Energy Points</Text>
            
            <View style={styles.divider} />
            
            {/* Action details */}
            <View style={styles.boostContainer}>
              <View style={styles.boostLeft}>
                <View style={styles.boostIconCircle}>
                  <Text style={styles.boostIcon}>{actionConfig?.icon ?? '🌱'}</Text>
                </View>
                <View>
                  <Text style={styles.boostLabel}>Action Verified</Text>
                  <Text style={styles.boostValue}>{actionConfig?.label ?? 'Eco Action'}</Text>
                </View>
              </View>
              {confidence && <Text style={styles.confidenceText}>
                {Math.round(confidence * 100)}% 🎯
              </Text>}
            </View>

            {detectedLabel && (
              <View style={styles.detectedContainer}>
                <Text style={styles.detectedLabel}>AI detected: {detectedLabel}</Text>
              </View>
            )}
          </Animated.View>

          {/* CTA Action */}
          <Animated.View style={{ width: '100%', opacity: fadeAnim }}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleReturn}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Return to Garden</Text>
              <Text style={styles.buttonIconPrimary}>➔</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  ambientTopLeft: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 128,
    height: 128,
    backgroundColor: '#87fc77',
    opacity: 0.15,
    borderRadius: 64,
  },
  ambientBottomRight: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    width: 192,
    height: 192,
    backgroundColor: '#94f68b',
    opacity: 0.2,
    borderRadius: 96,
  },
  ambientCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -192,
    marginTop: -192,
    width: 384,
    height: 384,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    opacity: 0.4,
    borderRadius: 192,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
    paddingTop: 20,
  },
  innerContent: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  mascotContainer: {
    width: 180,
    height: 180,
    marginBottom: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 128,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(0, 110, 9, 0.1)',
      },
      default: {
        shadowColor: '#006e09',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
    }),
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 8,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
    opacity: 0.8,
  },
  rewardCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)', boxShadow: '0 20px 40px rgba(22,163,74,0.1)' },
      default: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
    }),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 2,
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pointsIcon: {
    fontSize: 48,
    color: '#F4B400',
    marginRight: 12,
  },
  pointsValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#14532D',
    lineHeight: 64,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14532D',
    marginTop: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(216, 225, 211, 0.6)',
    marginVertical: 16,
  },
  boostContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boostIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  boostIcon: {
    fontSize: 24,
    color: '#14532D',
  },
  boostLabel: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  boostValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14532D',
  },
  trendingIcon: {
    fontSize: 28,
    color: '#4CAF50',
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532D',
  },
  detectedContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    width: '100%',
  },
  detectedLabel: {
    fontSize: 13,
    color: '#166534',
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#14532D',
    borderRadius: 999, // fully rounded pill
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
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
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  buttonIconPrimary: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
