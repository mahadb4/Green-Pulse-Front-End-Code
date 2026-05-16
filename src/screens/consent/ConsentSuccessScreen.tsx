import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

export default function ConsentSuccessScreen({ navigation }: any) {
  const handleEnterGarden = () => {
    // Navigate to S-09 Garden Screen (Core Loop)
    if (navigation && navigation.navigate) {
      navigation.navigate('Main');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brandText}>GreenPulse</Text>
          </View>

          {/* Success Card */}
          <View style={styles.card}>
            {/* Confetti / Decorative Dots */}
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />

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
              style={styles.button} 
              onPress={handleEnterGarden}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Enter Garden</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>

            {/* Secondary subtle link */}
            <TouchableOpacity style={styles.secondaryButton}>
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
    backgroundColor: '#F6F7F2',
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
  },
  header: {
    marginBottom: 32,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#2F8F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
  },
  dot1: {
    top: 32,
    left: 32,
    width: 16,
    height: 16,
    backgroundColor: '#87fc77',
    opacity: 0.5,
  },
  dot2: {
    top: 48,
    right: 40,
    width: 24,
    height: 24,
    backgroundColor: '#94f68b',
    opacity: 0.4,
  },
  dot3: {
    top: 96,
    left: '25%',
    width: 12,
    height: 12,
    backgroundColor: '#fa5f9c',
    opacity: 0.3,
  },
  zaraContainer: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#EEF2EA',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
    shadowColor: '#2F8F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  zaraImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#006e09',
    marginBottom: 12,
    textAlign: 'center',
    zIndex: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#68756B',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
    lineHeight: 28,
    zIndex: 10,
  },
  button: {
    backgroundColor: '#38AD32',
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    zIndex: 10,
    shadowColor: '#2F8F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#68756B',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});
