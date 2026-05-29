import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface Particle {
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotateDir: 1 | -1;
}

export const PARTICLES: Particle[] = [
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

export function FloatingParticle({ p }: { p: Particle }) {
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
  }, []); 

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

export function AuroraBlob({
  style,
  duration = 6000,
  delay = 0,
}: {
  style: any;
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
  }, []); 

  return (
    <Animated.View
      style={[style, { transform: [{ scale }, { translateY }], opacity }]}
    />
  );
}

export function PulseRing({ delay = 0, color = '#4ADE80' }: { delay?: number; color?: string }) {
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
  }, []); 

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

export default function AnimatedBackground() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
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
    </View>
  );
}

const ss = StyleSheet.create({
  skyBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0FFF4',
  },
  skyMid: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.60,
    backgroundColor: '#DCFCE7',
    opacity: 0.70,
    borderBottomLeftRadius:  width * 0.80,
    borderBottomRightRadius: width * 0.80,
  },
  skyTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.30,
    backgroundColor: '#BBF7D0',
    opacity: 0.50,
    borderBottomLeftRadius:  width * 0.70,
    borderBottomRightRadius: width * 0.70,
  },
  aurora: {
    position: 'absolute',
    borderRadius: 9999,
  },
  auroraTL: {
    width: width * 0.82, height: width * 0.82,
    top: -width * 0.28, left: -width * 0.28,
    backgroundColor: '#86EFAC',
  },
  auroraTR: {
    width: width * 0.55, height: width * 0.55,
    top: height * 0.03, right: -width * 0.18,
    backgroundColor: '#67E8F9',
  },
  auroraBC: {
    width: width * 0.80, height: width * 0.80,
    bottom: -width * 0.30, right: -width * 0.20,
    backgroundColor: '#6EE7B7',
  },
  auroraML: {
    width: width * 0.45, height: width * 0.45,
    top: height * 0.38, left: -width * 0.16,
    backgroundColor: '#FDE68A',
  },
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
  particle: {
    position: 'absolute',
  },
  pulseRing: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 2.5,
    backgroundColor: 'transparent',
  },
});
