import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});


const { width, height } = Dimensions.get('window');

// ── Cinematic init-loading screen ──────────────────────────────────────────
function InitLoadingScreen({ status }: { status: string }) {
  const logoFade  = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const glowPulse = useRef(new Animated.Value(0.65)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(logoFade,  { toValue: 1, duration: 650, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(logoScale, { toValue: 1, duration: 650, useNativeDriver: true, easing: Easing.out(Easing.back(1.3)) }),
    ]).start();

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1,    duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(glowPulse, { toValue: 0.65, duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    // Bouncing dots
    const dotAnim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -9, duration: 320, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
          Animated.timing(dot, { toValue: 0,  duration: 320, useNativeDriver: true, easing: Easing.in(Easing.quad)  }),
          Animated.delay(560),
        ])
      );
    dotAnim(dot1, 0).start();
    dotAnim(dot2, 160).start();
    dotAnim(dot3, 320).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={ls.container}>
      {/* Layered tinted background */}
      <View style={ls.bgBase} />
      <View style={ls.bgTop} />
      <View style={ls.bgBottom} />

      {/* Decorative blobs */}
      <View style={[ls.blob, ls.blobTL]} />
      <View style={[ls.blob, ls.blobBR]} />
      <View style={[ls.blob, ls.blobTR]} />

      {/* Static floating accent icons */}
      <Text style={[ls.floatIcon, { left: width*0.07, top: height*0.10, fontSize: 26 }]}>🍃</Text>
      <Text style={[ls.floatIcon, { left: width*0.80, top: height*0.08, fontSize: 20 }]}>🌿</Text>
      <Text style={[ls.floatIcon, { left: width*0.50, top: height*0.06, fontSize: 16 }]}>✨</Text>
      <Text style={[ls.floatIcon, { left: width*0.88, top: height*0.38, fontSize: 20 }]}>🌱</Text>
      <Text style={[ls.floatIcon, { left: width*0.04, top: height*0.55, fontSize: 14 }]}>💚</Text>

      {/* Center stage */}
      <View style={ls.center}>
        {/* Pulsing glow ring */}
        <Animated.View style={[ls.glowRing, {
          opacity: glowPulse,
          transform: [{
            scale: glowPulse.interpolate({ inputRange: [0.65, 1], outputRange: [0.85, 1.15] }),
          }],
        }]} />

        {/* Logo entrance */}
        <Animated.View style={{ opacity: logoFade, transform: [{ scale: logoScale }], alignItems: 'center' }}>
          <View style={ls.iconCard}>
            <Text style={ls.iconEmoji}>🍃</Text>
          </View>
          <Text style={ls.brandName}>GreenPulse</Text>
        </Animated.View>

        {/* Bouncing dot loader */}
        <View style={ls.dotsRow}>
          {([dot1, dot2, dot3] as Animated.Value[]).map((d, i) => (
            <Animated.View key={i} style={[ls.dot, { transform: [{ translateY: d }] }]} />
          ))}
        </View>

        {/* Status text */}
        <Text style={ls.statusText}>{status}</Text>
      </View>

      {/* Bottom accent bar */}
      <View style={ls.bottomBar} />
    </View>
  );
}

// ── App root ───────────────────────────────────────────────────────────────
function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const prevUserRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Listen to Firebase auth state changes.
    // When the user signs out (uid goes from something → null), reset to Welcome.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const prev = prevUserRef.current;
      prevUserRef.current = user?.uid ?? null;

      // If we have a logged-in user on initial load, skip onboarding and go to main flow
      if (prev === undefined && user) {
        setTimeout(() => {
          if (navigationRef.current?.isReady()) {
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          }
        }, 100);
        return; // no further checks needed
      }

      // Only redirect if we had a previous user (prev !== undefined means app already loaded)
      // and now we have no user — this means a sign-out just happened.
      if (prev !== undefined && prev !== null && !user) {
        // Give navigation a moment to be ready
        setTimeout(() => {
          if (navigationRef.current?.isReady()) {
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }, 100);
      }
    });
    
    // Forcefully hide the splash screen once App component mounts
    setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      console.log('[GREENPULSE_BOOT] SplashScreen.hideAsync() called');
    }, 500);

    return unsubscribe;
  }, []);

  const navigator = (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );

  return Platform.OS === 'web' ? (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>{navigator}</SafeAreaProvider>
    </View>
  ) : (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>{navigator}</SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;

// ── Loading screen stylesheet ──────────────────────────────────────────────
const ls = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgBase:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#E8F5E0' },
  bgTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: height * 0.42,
    backgroundColor: '#D4EDBB',
    opacity: 0.55,
    borderBottomLeftRadius: width * 0.6,
    borderBottomRightRadius: width * 0.6,
  },
  bgBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: height * 0.30,
    backgroundColor: '#B8DCA0',
    opacity: 0.32,
    borderTopLeftRadius: width * 0.5,
    borderTopRightRadius: width * 0.5,
  },
  blob: { position: 'absolute', borderRadius: 9999 },
  blobTL: {
    width: width*0.60, height: width*0.60,
    top: -width*0.20, left: -width*0.20,
    backgroundColor: '#C8E6A0', opacity: 0.40,
  },
  blobBR: {
    width: width*0.65, height: width*0.65,
    bottom: -width*0.22, right: -width*0.22,
    backgroundColor: '#B0D890', opacity: 0.28,
  },
  blobTR: {
    width: width*0.40, height: width*0.40,
    top: height*0.05, right: -width*0.14,
    backgroundColor: '#A8D878', opacity: 0.22,
  },
  floatIcon: { position: 'absolute', opacity: 0.35 },
  center:    { alignItems: 'center', zIndex: 10 },
  glowRing: {
    position: 'absolute',
    width: 190, height: 190, borderRadius: 95,
    backgroundColor: '#5CB85C', opacity: 0.12,
  },
  iconCard: {
    width: 108, height: 108, borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 22,
    ...Platform.select({
      web: { boxShadow: '0 12px 36px rgba(0,110,9,0.18)' },
      default: {
        shadowColor: '#006e09',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 22,
        elevation: 14,
      },
    }),
  },
  iconEmoji: {
    fontSize: 58,
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? 66 : undefined,
  },
  brandName: {
    fontSize: 42, fontWeight: '900', color: '#005A08',
    letterSpacing: -0.8, textAlign: 'center', includeFontPadding: false,
    ...Platform.select({
      web: { textShadow: '0 2px 8px rgba(0,90,8,0.12)' },
      default: {
        textShadowColor: 'rgba(0,90,8,0.12)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
      },
    }),
  },
  dotsRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginTop: 40, marginBottom: 14,
  },
  dot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#38AD32',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(56,173,50,0.4)' },
      default: {
        shadowColor: '#38AD32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
      },
    }),
  },
  statusText: {
    fontSize: 13, color: '#3A6B3A',
    fontWeight: '600', letterSpacing: 0.4,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 5, backgroundColor: '#38AD32', opacity: 0.45,
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
  },
});
