import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  const handleStart = () => {
    // Navigate to S-03 Nickname Entry (CJ-02)
    if (navigation && navigation.navigate) {
      navigation.navigate('Nickname');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>GreenPulse</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* 
            Zara Animation Placeholder
            Replace the Image below with the Three.js / Lottie animation component later.
            [Animation Placeholder (Zara State: Idle)]
          */}
          <View style={styles.zaraContainer}>
            <View style={styles.glow} />
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDs_QaNbjn7Wptd6yGc6SbEhfJTPACwSf5tts72H8PZNsyULtpJjOivrHi_Ie4zrKXprVFGyMZmUGThUtVDTB7_0FEUawPGsGrlw8vd5eKMosLr10v3CkLgNLhOHfMS79geB2YIFQTVC6VUt19kWTYD9IKHILG3Xew4hN1WS21pjJOIgPhb0zmTwPDujaLiiJCBIWqv7E7HwxyMNblKNdXkon-QQ39Bl6QId8J5s0vHJLfADpsKaKIQbgwHAMe7Y8ZUEfwsj-gxMPA' }}
              style={styles.zaraImage}
              resizeMode="contain"
            />
          </View>

          {/* Typography */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Hi, I’m Zara 🌱</Text>
            <Text style={styles.subtitle}>I’ll help you grow your shared eco garden.</Text>
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Let’s Start</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  header: {
    flexShrink: 0,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zaraContainer: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 320,
    maxHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 110, 9, 0.1)',
    borderRadius: 999,
    transform: [{ scale: 1.1 }],
  },
  zaraImage: {
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#68756B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  button: {
    backgroundColor: '#006e09',
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006e09',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
