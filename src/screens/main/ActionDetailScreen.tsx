import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Easing
} from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import { useEffect, useRef } from 'react';

export default function ActionDetailScreen({ navigation }: any) {
  // Mock points for this action (In real app, this would come from a DB/Props)
  const actionPoints = 75;

  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scannerAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleOpenCamera = () => {
    // Navigate to actual Camera screen
    if (navigation && navigation.navigate) {
      navigation.navigate('Camera', { points: actionPoints });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Main Content Container */}
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header / Logo */}
        <BrandHeader style={styles.header} transparent={true} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.iconCircle}>
              <Text style={styles.actionIcon}>💧</Text>
            </View>
            <Text style={styles.title}>Do Eco-Friendly Actions</Text>
            <Text style={styles.subtitle}>Take a clear photo of the action to verify and earn points.</Text>
          </View>

          {/* Example Photo Frame */}
          <View style={styles.exampleSection}>
            <View style={styles.exampleHeader}>
              <Text style={styles.exampleIcon}>🤖</Text>
              <Text style={styles.exampleLabel}>AI VERIFICATION EXAMPLE</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJar_BQwSvv92Z-HpoTzkP6Tb2vbiwkSZ-NvE7LbYyzxs3-tUJ7vlAtONC8cDdGOrwVaK88At9KmB8bE_KbXiKXK04mxYMhz-J_W8ahySnjkkRa4CurlnUbtUpL6ls_MFpkWQAr5jD3-JvqoHCIWT933hmYWDwySi8sSlzsf93OTGm36PC5X5seYci0eKbKdyjCnQoK0oIvN-eZkwUl3rqAuQcqyqNdB13a-ceDaN78wX7o2VnNN26aLRxRtKM1brOhX3hRxKsRMQ' }}
                style={styles.exampleImage}
                resizeMode="cover"
              />
              <Animated.View style={[styles.scannerLine, {
                transform: [{
                  translateY: scannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200]
                  })
                }]
              }]} />
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsTitle}>Photo Tips</Text>
              <View style={styles.tipsDivider} />
            </View>

            <View style={styles.tipsList}>
              {/* Tip 1 */}
              <View style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Text style={styles.tipIcon}>☀️</Text>
                </View>
                <View style={styles.tipTextContainer}>
                  <Text style={styles.tipTitle}>Good Lighting</Text>
                  <Text style={styles.tipDesc}>Ensure the subject is clearly visible.</Text>
                </View>
              </View>

              {/* Tip 2 */}
              <View style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Text style={styles.tipIcon}>🎯</Text>
                </View>
                <View style={styles.tipTextContainer}>
                  <Text style={styles.tipTitle}>In Focus</Text>
                  <Text style={styles.tipDesc}>Keep the camera steady for a sharp image.</Text>
                </View>
              </View>

              {/* Tip 3 */}
              <View style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Text style={styles.tipIcon}>🖼️</Text>
                </View>
                <View style={styles.tipTextContainer}>
                  <Text style={styles.tipTitle}>Frame It Well</Text>
                  <Text style={styles.tipDesc}>Capture the entire action in the frame.</Text>
                </View>
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Sticky Footer CTA */}
        <Animated.View style={[styles.footer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleOpenCamera}
            activeOpacity={0.85}
          >
            <View style={styles.buttonGlow} />
            <Text style={styles.buttonIcon}>🤖</Text>
            <Text style={styles.buttonText}>Open AI Scanner</Text>
          </TouchableOpacity>
        </Animated.View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  mainContent: {
    backgroundColor: '#F0FFF4',
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(56, 173, 50, 0.2)', // primary-container/20
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
    opacity: 0.8,
  },
  exampleSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  exampleIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#dee5d6',
    position: 'relative',
  },
  exampleImage: {
    width: '100%',
    height: '100%',
  },
  scannerLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: 'rgba(74, 222, 128, 0.8)',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  tipsSection: {
    paddingHorizontal: 4,
  },
  tipsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tipsDivider: {
    width: 32,
    height: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.4)',
    borderRadius: 2,
  },
  tipsList: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(20,83,45,0.04)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    }),
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#94f68b', // secondary-container
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: 'rgba(240, 255, 244, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  primaryButton: {
    backgroundColor: '#14532D',
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 8px 24px rgba(20, 83, 45, 0.2)' },
      default: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  buttonGlow: {
    display: 'none',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});
