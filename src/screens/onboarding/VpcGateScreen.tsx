import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image, Platform } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import AnimatedBackground from '../../components/AnimatedBackground';

const { width } = Dimensions.get('window');

export default function VpcGateScreen({ navigation, route }: any) {
  const handleParent = () => {
    // Navigate to Parent Verification / Data Review, forwarding the nickname
    if (navigation && navigation.navigate) {
      navigation.navigate('DataReview', { nickname: route?.params?.nickname });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />

      <BrandHeader transparent={true} />
      
      <View style={styles.innerContainer}>
        {/* Main Content Canvas */}
        <View style={styles.glassCard}>
          {/* Illustration Area */}
          <View style={styles.illustrationArea}>
            <View style={styles.iconCircle}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTXjWgodUplcXcGNBBeHPul5acCSvOBhX_E8F4J-xzSMACfdgrO8q48Red48hfoocl0pI4_Lk9QkmZzq3hRHMmh1m0FoIZXU0Guu-F-GVrhuZD_LsO6lP5Jg5B8corfwkVylG5JYqtI19o3TB2Cq4GfZ6_tiRhaXUU-BKqnujYfKoG9ceC4Xd3vaYFEVp5AGZM2sfeFRZVyJeOMh7u93gzsLsBsOpr4KI_BUK-U6djMdCJO_Lh5O9snVF3zM0xW84qymDuV-t_tMQ' }}
              style={styles.zaraImage}
              resizeMode="cover"
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.title}>Almost ready!</Text>
            <Text style={styles.subtitle}>Ask a parent to unlock your camera to continue.</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleParent}
            activeOpacity={0.85}
          >
            <Text style={styles.familyIcon}>👨‍👩‍👧</Text>
            <Text style={styles.buttonText}>I’m the Parent</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 32,
    paddingBottom: 40,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
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
  illustrationArea: {
    width: 160,
    height: 160,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconCircle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 56,
  },
  zaraImage: {
    position: 'absolute',
    right: -12,
    bottom: -12,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#166534',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#14532D',
    flexDirection: 'row',
    height: 56,
    width: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
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
  familyIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});
