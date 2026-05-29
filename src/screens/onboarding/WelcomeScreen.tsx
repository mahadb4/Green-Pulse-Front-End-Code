import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AnimatedBackground, { PulseRing } from '../../components/AnimatedBackground';

const { width } = Dimensions.get('window');

import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function WelcomeScreen({ navigation }: any) {
  const [isReturning, setIsReturning] = useState(false);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      // User is logged in, fetch profile
      getDoc(doc(db, 'children', uid)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          setFirstName(data.firstName ?? '');
          setIsReturning(true);
        }
      }).catch((e) => {
        console.warn('[WelcomeScreen] error fetching profile:', e);
      });
    }
  }, []);

  // Logo entrance
  const logoFade   = useRef(new Animated.Value(0)).current;
  const logoScale  = useRef(new Animated.Value(0.72)).current;
  const logoSlide  = useRef(new Animated.Value(40)).current;

  // Wordmark
  const wordFade   = useRef(new Animated.Value(0)).current;
  const wordSlide  = useRef(new Animated.Value(20)).current;

  // Subtitle & AI Badge
  const subFade    = useRef(new Animated.Value(0)).current;

  // Logo leaf spin
  const leafSpin   = useRef(new Animated.Value(0)).current;

  // Glassmorphism card glow
  const cardGlow   = useRef(new Animated.Value(0.5)).current;

  // Buttons reveal
  const [showActions, setShowActions] = useState(false);
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const actionsSlide   = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.timing(logoFade,  { toValue: 1,  duration: 780, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(logoScale, { toValue: 1,  duration: 780, useNativeDriver: true, easing: Easing.out(Easing.back(1.6)) }),
        Animated.timing(logoSlide, { toValue: 0,  duration: 780, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
      Animated.parallel([
        Animated.timing(wordFade,  { toValue: 1,  duration: 520, useNativeDriver: true, easing: Easing.ease }),
        Animated.timing(wordSlide, { toValue: 0,  duration: 520, useNativeDriver: true, easing: Easing.ease }),
      ]),
      Animated.timing(subFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Loops
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafSpin, { toValue: 1,  duration: 3200, useNativeDriver: true, easing: Easing.ease }),
        Animated.timing(leafSpin, { toValue: -1, duration: 3200, useNativeDriver: true, easing: Easing.ease }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cardGlow, { toValue: 1,   duration: 2200, useNativeDriver: true, easing: Easing.ease }),
        Animated.timing(cardGlow, { toValue: 0.5, duration: 2200, useNativeDriver: true, easing: Easing.ease }),
      ])
    ).start();

    // Show actions after 4.5 seconds for better UX
    const timer = setTimeout(() => {
      setShowActions(true);
      Animated.parallel([
        Animated.timing(actionsOpacity, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.ease }),
        Animated.timing(actionsSlide,   { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.ease }),
      ]).start();
    }, 4500);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const leafRotate = leafSpin.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });
  const cardShadowOpacity = cardGlow.interpolate({ inputRange: [0.5, 1], outputRange: [0.25, 0.55] });
  const cardShadowScale   = cardGlow.interpolate({ inputRange: [0.5, 1], outputRange: [1.0, 1.08] });

  return (
    <View style={ss.container}>
      <AnimatedBackground />

      <SafeAreaView style={ss.safeArea}>
        <View style={ss.centerStage}>
          {/* AI Pulse rings emanating from logo */}
          <PulseRing delay={0}    color="#4ADE80" />
          <PulseRing delay={700}  color="#34D399" />
          <PulseRing delay={1400} color="#6EE7B7" />

          {/* Glassmorphism logo container */}
          <Animated.View
            style={[
              ss.glassCard,
              {
                opacity: logoFade,
                transform: [
                  { scale: logoScale },
                  { translateY: logoSlide },
                ],
              },
            ]}
          >
            {/* Inner glow layer */}
            <Animated.View
              style={[
                ss.innerGlow,
                {
                  opacity: cardShadowOpacity,
                  transform: [{ scale: cardShadowScale }],
                },
              ]}
            />
            {/* Logo leaf emoji with subtle spin */}
            <Animated.Text style={[ss.logoLeaf, { transform: [{ rotate: leafRotate }] }]}>
              🌿
            </Animated.Text>
            {/* Sparkle accent */}
            <Text style={ss.logoSparkle}>✨</Text>
          </Animated.View>

          {/* GreenPulse wordmark */}
          <Animated.View
            style={[
              ss.wordmarkWrap,
              {
                opacity: wordFade,
                transform: [{ translateY: wordSlide }],
              },
            ]}
          >
            <Text style={ss.brandName}>GreenPulse</Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.Text style={[ss.subtitle, { opacity: subFade }]}>
            {isReturning ? `Welcome back ${firstName}, let's grow your garden.` : 'Collaborative Carbon Garden'}
          </Animated.Text>

          {/* AI badge */}
          <Animated.View style={[ss.aiBadge, { opacity: subFade }]}>
            <Text style={ss.aiBadgeText}>🤖 Powered by AI</Text>
          </Animated.View>

          {/* Login / Sign Up buttons */}
          {showActions && (
            <Animated.View style={[ss.buttonContainer, { opacity: actionsOpacity, transform: [{ translateY: actionsSlide }] }]}>
              <TouchableOpacity
                style={ss.buttonPrimary}
                onPress={() => navigation.navigate('StudentInfo')}
                activeOpacity={0.85}
              >
                <Text style={ss.buttonTextPrimary}>Get Started</Text>
                <Text style={ss.buttonIconPrimary}>✨</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={ss.buttonSecondary}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={ss.buttonTextSecondary}>Log In</Text>
                <Text style={ss.buttonIconSecondary}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

        </View>
      </SafeAreaView>

      {/* Bottom glow strip */}
      <View style={ss.bottomStrip} />
      <View style={ss.bottomStripInner} />
    </View>
  );
}

const ss = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: '100%',
  },
  glassCard: {
    width: 140,
    height: 140,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)',
        boxShadow: '0 20px 60px rgba(22,163,74,0.35), 0 0 0 1px rgba(255,255,255,0.6) inset',
      },
      default: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.38,
        shadowRadius: 32,
        elevation: 22,
      },
    }),
  },
  innerGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#4ADE80',
    opacity: 0.18,
  },
  logoLeaf: {
    fontSize: 72,
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? 82 : undefined,
  },
  logoSparkle: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 18,
    opacity: 0.90,
  },
  wordmarkWrap: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#14532D',
    letterSpacing: -1.5,
    textAlign: 'center',
    includeFontPadding: false,
    ...Platform.select({
      web: { textShadow: '0 3px 16px rgba(20,83,45,0.20)' },
      default: {
        textShadowColor: 'rgba(20,83,45,0.22)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 12,
      },
    }),
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    textAlign: 'center',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 8,
    opacity: 0.80,
  },
  aiBadge: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 30,
    backgroundColor: 'rgba(74,222,128,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.50)',
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.6,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
    marginTop: 48,
    paddingHorizontal: 20,
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14532D', // Deep premium forest green
    paddingVertical: 18,
    borderRadius: 999,
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(20,83,45,0.3)' },
      default: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  buttonIconPrimary: {
    fontSize: 18,
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(20,83,45,0.1)',
    ...Platform.select({
      web: { boxShadow: '0 8px 20px rgba(0,0,0,0.06)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  buttonTextSecondary: {
    color: '#14532D',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  buttonIconSecondary: {
    color: '#14532D',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomStrip: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 5,
    backgroundColor: '#4ADE80',
    opacity: 0.70,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  bottomStripInner: {
    position: 'absolute',
    bottom: 5, left: width * 0.25, right: width * 0.25,
    height: 3,
    backgroundColor: '#22C55E',
    opacity: 0.45,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
