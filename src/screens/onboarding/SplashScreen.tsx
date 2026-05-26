import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Animated, Easing } from 'react-native';
import { signInAnonymously } from '../../services/authService';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Premium animation: fade in and scale up smoothly
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      })
    ]).start();

    // Fire ONCE on mount: sign in anonymously then navigate
    const init = async () => {
      // Establish Firebase Anonymous Auth — this is required for ALL Firestore writes.
      // Without this, auth.currentUser is null and every write fails with permission-denied.
      await signInAnonymously();

      // Navigate to Welcome after auth is established
      if (navigation && navigation.replace) {
        navigation.replace('Welcome');
      }
    };

    // 2.5s minimum splash so the screen is visible, auth runs in parallel
    const timer = setTimeout(init, 2500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      {/* Soft Organic Background Elements */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Main Content Canvas perfectly centered */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🍃</Text>
        </View>
        <Text style={styles.title}>GreenPulse</Text>
        <Text style={styles.slogan}>The Collaborative Carbon Garden</Text>
        
        {/* Loading Indicator perfectly spaced */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#006e09" />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.1,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#eff6e7',
    opacity: 0.7,
  },
  blob2: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.15,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#e9f0e1',
    opacity: 0.7,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#006e09',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  icon: {
    fontSize: 54,
    textAlign: 'center',
    color: '#006e09',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#006e09',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    color: '#68756B',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 48, // Space between slogan and spinner
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, // Fixed height to avoid layout shift when spinner appears
  }
});
