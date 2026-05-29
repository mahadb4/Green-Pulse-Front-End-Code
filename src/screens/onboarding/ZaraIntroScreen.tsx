import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import AnimatedBackground from '../../components/AnimatedBackground';
import TypewriterText from '../../components/TypewriterText';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function ZaraIntroScreen({ navigation, route }: any) {
  const [childName, setChildName] = useState<string | null>(null);
  const [nameLoaded, setNameLoaded] = useState(false);
  const [headingFinished, setHeadingFinished] = useState(false);
  const [subtitleFinished, setSubtitleFinished] = useState(false);
  
  const isReturningUser = route?.params?.isReturningUser === true;

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;

  // Stable callbacks using useCallback to prevent TypewriterText re-render loops
  const onHeadingComplete = useCallback(() => {
    setHeadingFinished(true);
  }, []);

  const onSubtitleComplete = useCallback(() => {
    setSubtitleFinished(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Fetch user name from multiple sources as fallback chain
    const fetchName = async () => {
      const uid = auth.currentUser?.uid;

      // Source 1: Route params (passed from NicknameScreen flow)
      const routeNickname = route?.params?.nickname;
      if (routeNickname) {
        if (!cancelled) {
          setChildName(routeNickname);
          setNameLoaded(true);
        }
        return;
      }

      if (!uid) {
        // No auth — proceed without name
        if (!cancelled) setNameLoaded(true);
        return;
      }

      // Source 2: children collection (primary)
      try {
        const childSnap = await Promise.race([
          getDoc(doc(db, 'children', uid)),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ]);
        const childData = (childSnap as any).data?.();
        if (childData) {
          const nameToUse = childData.firstName || childData.nickname || childData.fullName?.split(' ')[0] || childData.username;
          if (nameToUse) {
            if (!cancelled) {
              setChildName(nameToUse);
              setNameLoaded(true);
            }
            return;
          }
        }
      } catch (err: any) {
        console.warn('[ZaraIntro] children fetch failed:', err?.message);
      }

      // Source 3: users collection (backup)
      try {
        const userSnap = await Promise.race([
          getDoc(doc(db, 'users', uid)),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ]);
        const userData = (userSnap as any).data?.();
        if (userData) {
          const nameToUse = userData.firstName || userData.nickname || userData.fullName?.split(' ')[0] || userData.username;
          if (nameToUse) {
            if (!cancelled) {
              setChildName(nameToUse);
              setNameLoaded(true);
            }
            return;
          }
        }
      } catch (err: any) {
        console.warn('[ZaraIntro] users fetch failed:', err?.message);
      }

      // Source 4: Firebase Auth displayName
      const displayName = auth.currentUser?.displayName;
      if (displayName) {
        if (!cancelled) {
          setChildName(displayName);
          setNameLoaded(true);
        }
        return;
      }

      // No name found — proceed without it
      if (!cancelled) setNameLoaded(true);
    };

    fetchName();

    // Safety timeout: ensure nameLoaded is set even if all fetches hang
    const safetyTimer = setTimeout(() => {
      if (!cancelled) setNameLoaded(true);
    }, 6000);

    // Trigger entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show button when subtitle finishes typing
  useEffect(() => {
    if (subtitleFinished) {
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [subtitleFinished]); // eslint-disable-line react-hooks/exhaustive-deps

  // Safety: auto-show button after 8s in case typewriter gets stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!subtitleFinished) {
        setHeadingFinished(true);
        setSubtitleFinished(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    if (navigation && navigation.reset) {
      // Use reset to prevent going back to onboarding screens
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Main');
    }
  };

  const displayName = childName ? childName.charAt(0).toUpperCase() + childName.slice(1) : 'Friend';
  
  const headingText = isReturningUser ? `Welcome back ${displayName} 🌱` : `Hi ${displayName} 🌱`;
  const subtitleText = isReturningUser 
    ? `Your garden is missing you!\nContinue growing your garden and making a positive impact today.`
    : `I'm Zara, your personal garden assistant.\nI'll help you grow your garden, guide you through the app, and support you every step of the way.`;

  // Don't render the typewriter until we know the name (or gave up trying)
  if (!nameLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <AnimatedBackground />
        <BrandHeader transparent={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🌿</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />

      <BrandHeader transparent={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <Animated.View
            style={[
              styles.glassCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.zaraContainer}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHsxg_rpZw-XAgn2T5LTNIw_DoeJz8_HJnfR5EvlxQUAfB4Psc2uIaJ_g6U7vqWT9Ls_TzoAGdwRn0XSqXeGOmw9ypfhmNEi8hf8nlgPD15sGqRxs_xrf_NTvqj7FzRhd5n4T62hhBlEBAXAMYdnW6FNAQt8VLYGC89EIXGnPLY7XWKTcE8H2W7PtYMMfcNAFbPAc5jEU8kAt5wlarMq8Ie5ypdxe4Het-_vxGyvIhZsUGpqIU3P7TxyA5BSolY5ZR8H0UL3TIizM',
                }}
                style={styles.zaraImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.textContainer}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI ASSISTANT</Text>
              </View>
              <TypewriterText
                text={headingText}
                style={styles.title}
                speed={20}
                typingDelay={300}
                onComplete={onHeadingComplete}
              />

              {headingFinished ? (
                <TypewriterText
                  text={subtitleText}
                  style={styles.subtitle}
                  speed={12}
                  typingDelay={100}
                  onComplete={onSubtitleComplete}
                />
              ) : (
                <Text style={[styles.subtitle, { opacity: 0 }]}>
                  {subtitleText}
                </Text>
              )}
            </View>

            <Animated.View
              style={{
                width: '100%',
                opacity: buttonFade,
                transform: [{ translateY: buttonSlide }],
              }}
            >
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={handleStart}
                activeOpacity={0.85}
                disabled={!subtitleFinished}
              >
                <Text style={styles.buttonTextPrimary}>Enter Your Garden</Text>
                <Text style={styles.arrowIcon}>🌿</Text>
              </TouchableOpacity>
            </Animated.View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 48,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    zIndex: 10,
  },
  glassCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)',
        boxShadow: '0 20px 40px rgba(22,163,74,0.15)',
      },
      default: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  zaraContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(74,222,128,0.15)',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  zaraImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    minHeight: 160, // Reserve space for full multi-line message
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  aiBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  aiBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 16,
    textAlign: 'center',
    zIndex: 10,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#047857',
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 26,
    zIndex: 10,
  },
  buttonPrimary: {
    backgroundColor: '#006e09',
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(0,110,9,0.3)' },
      default: {
        shadowColor: '#006e09',
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
  arrowIcon: {
    fontSize: 20,
  },
});
