import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    // Navigate to the Welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      // We will replace this with navigation.replace('Welcome') once navigation is set up
      if (navigation && navigation.replace) {
        navigation.replace('Welcome');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Soft Organic Background Elements */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Main Content Canvas */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.icon}>🍃</Text>
          <Text style={styles.title}>GreenPulse</Text>
        </View>
        <Text style={styles.slogan}>The Collaborative Carbon Garden</Text>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#006e09" />
      </View>
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
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#eff6e7',
    opacity: 0.6,
  },
  blob2: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.1,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#e9f0e1',
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 48,
    marginRight: 12,
    color: '#006e09',
  },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  slogan: {
    fontSize: 18,
    color: '#68756B',
    marginTop: 8,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }
});
