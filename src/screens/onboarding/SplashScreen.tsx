/**
 * SplashScreen – Premium magical brand reveal.
 *
 * Rules (strict):
 *  ✅ NO status text, NO "Signing in", NO loading dots, NO spinners
 *  ✅ ONLY: animated logo + app name + magical background
 *  ✅ Auto-transitions to the App's InitLoadingScreen after ~2.4 s
 *
 * Layers (bottom → top):
 *  1. Deep gradient sky (multi-stop simulation with nested views)
 *  2. Animated aurora blobs (organic, slow-drifting)
 *  3. Ground — rolling meadow hills
 *  4. Floating eco-particles (leaves, sparkles, stars)
 *  5. Glassmorphism logo container with AI pulse rings
 *  6. "GreenPulse" wordmark + subtitle reveal
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Floating particle data
// ─────────────────────────────────────────────────────────────────────────────
interface Particle {
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotateDir: 1 | -1;
}

const PARTICLES: Particle[] = [
  { emoji: '🍃', x: width*0.06,  y: height*0.11, size: 30, duration: 4800, delay: 0,    drift: 22,  rotateDir:  1 },
  { emoji: '🌿', x: width*0.83,  y: height*0.09, size: 24, duration: 5600, delay: 500,  drift:-18,  rotateDir: -1 },
  { emoji: '✨', x: width*0.52,  y: height*0.06, size: 20, duration: 3800, delay: 200,  drift: 10,  rotateDir:  1 },
  { emoji: '🍀', x: width*0.14,  y: height*0.76, size: 26, duration: 5100, delay: 800,  drift:-24,  rotateDir: -1 },
  { emoji: '⭐', x: width*0.78,  y: height*0.73, size: 22, duration: 4300, delay: 350,  drift: 16,  rotateDir:  1 },
  { emoji: '🌱', x: width*0.90,  y: height*0.42, size: 22, duration: 5400, delay: 100,  drift:-12,  rotateDir: -1 },
  { emoji: '💚', x: width*0.04,  y: height*0.54, size: 18, duration: 4600, delay: 650,  drift: 20,  rotateDir:  1 },
  { emoji: '🌸', x: width*0.67,  y: height*0.87, size: 20, duration: 4100, delay: 250,  drift:-10,  rotateDir: -1 },
  { emoji: '🌟', x: width*0.35,  y: height*0.83, size: 18, duration: 3600, delay: 720,  drift: 14,  rotateDir:  1 },
  { emoji: '🍃', x: width*0.74,  y: height*0.18, size: 22, duration: 5200, delay: 420,  drift:-16,  rotateDir: -1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated floating particle
// ─────────────────────────────────────────────────────────────────────────────
function FloatingParticle({ p }: { p: Particle }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const rotate     = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const run = () => {
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 0.90, duration: 700,            useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(scale,      { toValue: 1.0,  duration: 700,            useNativeDriver: true, easing: Easing.out(Easing.back(1.2)) }),
          Animated.timing(translateY, { toValue: -36,  duration: p.duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(translateX, { toValue: p.drift, duration: p.duration,  useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(rotate,     { toValue: 1,    duration: p.duration,     useNativeDriver: true, easing: Easing.ease }),
        ]),
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 0,   duration: 700,            useNativeDriver: true }),
          Animated.timing(scale,      { toValue: 0.7, duration: 400,            useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0,   duration: p.duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(translateX, { toValue: 0,   duration: 1,              useNativeDriver: true }),
          Animated.timing(rotate,     { toValue: 0,   duration: 1,              useNativeDriver: true }),
        ]),
      ]).start(run);
    };
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rotateDir * 25}deg`] });

  return (
    <Animated.Text
      style={[
        ss.particle,
        {
          fontSize: p.size,
          left:     p.x,
          top:      p.y,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate: spin }, { scale }],
        },
      ]}
    >
      {p.emoji}
    </Animated.Text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Aurora blob (slow-drifting ambient glow)
// ─────────────────────────────────────────────────────────────────────────────
function AuroraBlob({
  style,
  duration = 6000,
  delay = 0,
}: {
  style: object;
  duration?: number;
  delay?: number;
}) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.18)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,      { toValue: 1.12, duration, useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(opacity,    { toValue: 0.28, duration, useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(translateY, { toValue: -14,  duration, useNativeDriver: true, easing: Easing.ease }),
        ]),
        Animated.parallel([
          Animated.timing(scale,      { toValue: 1,    duration, useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(opacity,    { toValue: 0.18, duration, useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(translateY, { toValue: 0,    duration, useNativeDriver: true, easing: Easing.ease }),
        ]),
      ])
    ).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      style={[style, { transform: [{ scale }, { translateY }], opacity }]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Pulse ring (emanates from logo center)
// ─────────────────────────────────────────────────────────────────────────────
function PulseRing({ delay = 0, color = '#4ADE80' }: { delay?: number; color?: string }) {
  const scale   = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const run = () => {
      scale.setValue(0.6);
      opacity.setValue(0.7);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 2.2, duration: 2000, useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(opacity, { toValue: 0,   duration: 2000, useNativeDriver: true, easing: Easing.ease }),
        ]),
      ]).start(run);
    };
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        ss.pulseRing,
        {
          borderColor: color,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SplashScreen — pure brand reveal, NO loading text
// ─────────────────────────────────────────────────────────────────────────────
export default function SplashScreen({ navigation }: any) {
  // Logo entrance
  const logoFade   = useRef(new Animated.Value(0)).current;
  const logoScale  = useRef(new Animated.Value(0.72)).current;
  const logoSlide  = useRef(new Animated.Value(40)).current;

  // Wordmark
  const wordFade   = useRef(new Animated.Value(0)).current;
  const wordSlide  = useRef(new Animated.Value(20)).current;

  // Subtitle
  const subFade    = useRef(new Animated.Value(0)).current;

  // Logo leaf spin
  const leafSpin   = useRef(new Animated.Value(0)).current;

  // Glassmorphism card glow
  const cardGlow   = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // ── Entrance sequence (same UI animations)
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

    // Continuous leaf spin and card glow remain unchanged
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

    // SplashScreen is a pure brand reveal — no auth or navigation side-effects.
    // Authentication and navigation happen via WelcomeScreen → Login / Sign Up buttons.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const leafRotate = leafSpin.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });

  const cardShadowOpacity = cardGlow.interpolate({ inputRange: [0.5, 1], outputRange: [0.25, 0.55] });
  const cardShadowScale   = cardGlow.interpolate({ inputRange: [0.5, 1], outputRange: [1.0, 1.08] });

  return (
    <View style={ss.container}>

      {/* ── Layer 1: Deep gradient sky ──────────────────────────────── */}
      <View style={ss.skyBase} />
      <View style={ss.skyMid} />
      <View style={ss.skyTop} />

      {/* ── Layer 2: Aurora blobs ───────────────────────────────────── */}
      <AuroraBlob style={[ss.aurora, ss.auroraTL]} duration={7000} delay={0}    />
      <AuroraBlob style={[ss.aurora, ss.auroraTR]} duration={8500} delay={1200} />
      <AuroraBlob style={[ss.aurora, ss.auroraBC]} duration={6500} delay={600}  />
      <AuroraBlob style={[ss.aurora, ss.auroraML]} duration={9000} delay={2000} />

      {/* ── Layer 3: Rolling meadow hills ───────────────────────────── */}
      <View style={ss.hill1} />
      <View style={ss.hill2} />
      <View style={ss.hill3} />

      {/* ── Layer 4: Floating eco-particles ─────────────────────────── */}
      {PARTICLES.map((p, i) => <FloatingParticle key={i} p={p} />)}

      {/* ── Layer 5 & 6: Center stage ───────────────────────────────── */}
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
          Collaborative Carbon Garden
        </Animated.Text>

        {/* AI badge */}
        <Animated.View style={[ss.aiBadge, { opacity: subFade }]}>
          <Text style={ss.aiBadgeText}>🤖 Powered by AI</Text>
        </Animated.View>

      </View>

      {/* ── Bottom glow strip ───────────────────────────────────────── */}
      <View style={ss.bottomStrip} />
      <View style={ss.bottomStripInner} />

    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stylesheet
// ─────────────────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // ── Background sky gradient (simulated)
  skyBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0FFF4',   // soft mint white
  },
  skyMid: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.60,
    backgroundColor: '#DCFCE7',   // fresh mint
    opacity: 0.70,
    borderBottomLeftRadius:  width * 0.80,
    borderBottomRightRadius: width * 0.80,
  },
  skyTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.30,
    backgroundColor: '#BBF7D0',   // vivid mint
    opacity: 0.50,
    borderBottomLeftRadius:  width * 0.70,
    borderBottomRightRadius: width * 0.70,
  },

  // ── Aurora blobs
  aurora: {
    position: 'absolute',
    borderRadius: 9999,
  },
  auroraTL: {
    width: width * 0.82, height: width * 0.82,
    top: -width * 0.28, left: -width * 0.28,
    backgroundColor: '#86EFAC',   // green aurora
  },
  auroraTR: {
    width: width * 0.55, height: width * 0.55,
    top: height * 0.03, right: -width * 0.18,
    backgroundColor: '#67E8F9',   // sky-blue aurora
  },
  auroraBC: {
    width: width * 0.80, height: width * 0.80,
    bottom: -width * 0.30, right: -width * 0.20,
    backgroundColor: '#6EE7B7',   // teal aurora
  },
  auroraML: {
    width: width * 0.45, height: width * 0.45,
    top: height * 0.38, left: -width * 0.16,
    backgroundColor: '#FDE68A',   // warm yellow accent
  },

  // ── Rolling hills
  hill1: {
    position: 'absolute',
    bottom: 0, left: -width * 0.1, right: -width * 0.1,
    height: height * 0.22,
    backgroundColor: '#4ADE80',
    opacity: 0.28,
    borderTopLeftRadius:  width * 0.9,
    borderTopRightRadius: width * 0.9,
  },
  hill2: {
    position: 'absolute',
    bottom: 0, left: -width * 0.2, right: -width * 0.2,
    height: height * 0.14,
    backgroundColor: '#22C55E',
    opacity: 0.20,
    borderTopLeftRadius:  width * 1.0,
    borderTopRightRadius: width * 1.0,
  },
  hill3: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: height * 0.08,
    backgroundColor: '#16A34A',
    opacity: 0.18,
    borderTopLeftRadius:  width * 0.8,
    borderTopRightRadius: width * 0.8,
  },

  // ── Particle
  particle: {
    position: 'absolute',
  },

  // ── Center stage
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // ── AI pulse ring
  pulseRing: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 2.5,
    backgroundColor: 'transparent',
  },

  // ── Glassmorphism logo card
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

  // ── Wordmark
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

  // ── Subtitle
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

  // ── AI badge
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

  // ── Bottom glow strips
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
