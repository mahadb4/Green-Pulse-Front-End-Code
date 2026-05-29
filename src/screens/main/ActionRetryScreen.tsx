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
  Animated,
  Easing
} from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import { useEffect, useRef } from 'react';

export default function ActionRetryScreen({ navigation, route }: any) {
  const { reason = 'Action not clearly visible', confidence } = route.params || {};

  // Animations
  const bounceAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const handleTryAgain = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Camera');
    }
  };

  const handleCancel = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Main');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      
      {/* Brand Header */}
      <BrandHeader transparent={true} />

      <View style={styles.contentWrapper}>
        {/* Main Card Container */}
        <View style={styles.mainCard}>
          
          {/* Illustration */}
          <Animated.View style={[styles.mascotContainer, { opacity: fadeAnim, transform: [{ scale: bounceAnim }] }]}>
            <View style={styles.glowEffect} />
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7fRaphkEV5-cbpjNjIQlPCwHWA0Ch1MrjftoBLOZvHtLSNf-JPdYSFfw-NyKofOH52HxJ5dYyd0FfVBuzJc3ZdNOw-M9TZ8Do2bTbghUasWfFJYKGCtyE5CJOu1wLnNW861RUzkIZkDj_7cnEukDIb7UH5MR755WOklVlhqfumFpZawHRIY7ZqbVTbM8fswhYSU_wf6RQ5D-2cpoUAlsKDWgQSssHVaW_ZXrU8C6nx6GGKw5FddsZffziOPq2TVPs1tLdSu4PaEE' }}
              style={styles.mascotImage}
              resizeMode="cover"
            />
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
          </Animated.View>

          {/* Text Content */}
          <Animated.View style={[styles.textSection, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Oops! Let's try again.</Text>
            <Text style={styles.subtitle}>{reason}</Text>
            {confidence !== undefined && (
              <Text style={styles.confidenceText}>
                AI confidence: {Math.round(confidence * 100)}% (need 80%+)
              </Text>
            )}
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleTryAgain}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonIconPrimary}>↻</Text>
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
          
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
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mainCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 32,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)', boxShadow: '0 20px 40px rgba(22,163,74,0.1)' },
      default: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
    }),
  },
  mascotContainer: {
    width: 224,
    height: 224,
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 218, 214, 0.3)', // error-container/30
    borderRadius: 112,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 112,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(186, 26, 26, 0.08)',
      },
      default: {
        shadowColor: '#ba1a1a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
    }),
    zIndex: 10,
  },
  errorIconContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
    zIndex: 20,
  },
  errorIcon: {
    fontSize: 24,
    color: '#ba1a1a',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#166534',
    textAlign: 'center',
    fontWeight: '500',
  },
  confidenceText: {
    fontSize: 13,
    color: '#E35D5D',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#14532D', // primary-container
    borderRadius: 999, // full pill
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
    marginBottom: 8,
  },
  buttonIconPrimary: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '800',
  }
});
