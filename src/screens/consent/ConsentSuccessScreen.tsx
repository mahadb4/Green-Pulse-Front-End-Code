import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, Alert, Platform } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import AnimatedBackground from '../../components/AnimatedBackground';

const { width } = Dimensions.get('window');

export default function ConsentSuccessScreen({ navigation, route }: any) {
  const handleEnterGarden = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ZaraIntro', { nickname: route?.params?.nickname });
    }
  };

  const handleViewSetup = () => {
    // Show a summary of what was set up during onboarding
    Alert.alert(
      '✅ Setup Complete',
      'Here\'s what we set up for you:\n\n' +
      '• 🪴 Eco Garden created\n' +
      '• 👤 Nickname saved\n' +
      '• 🛡️ Parent consent recorded\n' +
      '• 📷 Camera ready for eco-actions\n\n' +
      'Tap Enter Garden to start earning points!',
      [{ text: 'Got it!', onPress: handleEnterGarden }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />

      <BrandHeader transparent={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>

          {/* Success Card */}
          <View style={styles.glassCard}>

            {/* 
              Zara Mascot Waiting State 
              Replace the Image below with the Three.js / Lottie animation component later.
              [Animation Placeholder (Zara State: Happy)]
            */}
            <View style={styles.zaraContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHsxg_rpZw-XAgn2T5LTNIw_DoeJz8_HJnfR5EvlxQUAfB4Psc2uIaJ_g6U7vqWT9Ls_TzoAGdwRn0XSqXeGOmw9ypfhmNEi8hf8nlgPD15sGqRxs_xrf_NTvqj7FzRhd5n4T62hhBlEBAXAMYdnW6FNAQt8VLYGC89EIXGnPLY7XWKTcE8H2W7PtYMMfcNAFbPAc5jEU8kAt5wlarMq8Ie5ypdxe4Het-_vxGyvIhZsUGpqIU3P7TxyA5BSolY5ZR8H0UL3TIizM' }}
                style={styles.zaraImage}
                resizeMode="cover"
              />
            </View>

            {/* Typography */}
            <Text style={styles.title}>You’re all set!</Text>
            <Text style={styles.subtitle}>
              Your eco garden is ready to grow. Start tracking your actions and watch it flourish.
            </Text>

            {/* Primary Action */}
            <TouchableOpacity 
              style={styles.buttonPrimary} 
              onPress={handleEnterGarden}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonTextPrimary}>Enter Garden</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>

            {/* Secondary subtle link */}
            <TouchableOpacity style={styles.secondaryButton} onPress={handleViewSetup}>
              <Text style={styles.secondaryButtonText}>View Setup Details</Text>
            </TouchableOpacity>

          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
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
    width: 160,
    height: 160,
    borderRadius: 80,
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
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 12,
    textAlign: 'center',
    zIndex: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#166534',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
    lineHeight: 24,
    zIndex: 10,
  },
  buttonPrimary: {
    backgroundColor: '#14532D',
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    zIndex: 10,
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
  arrowIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 8,
    zIndex: 10,
  },
  secondaryButtonText: {
    color: '#14532D',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    opacity: 0.8,
  }
});
