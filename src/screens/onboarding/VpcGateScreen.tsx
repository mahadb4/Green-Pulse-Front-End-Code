import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import BrandHeader from '../../components/BrandHeader';

const { width } = Dimensions.get('window');

export default function VpcGateScreen({ navigation }: any) {
  const handleParent = () => {
    // Navigate to Parent Verification / Data Review
    if (navigation && navigation.navigate) {
      navigation.navigate('DataReview');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Background Elements */}
      <View style={styles.bgBlobTop} />
      <View style={styles.bgBlobBottom} />

      <BrandHeader />
      <View style={styles.innerContainer}>

        {/* Main Content Canvas */}
        <View style={styles.card}>
          {/* Illustration Area */}
          <View style={styles.illustrationArea}>
            <View style={styles.iconCircle}>
              <Text style={styles.lockIcon}>🔒</Text>
              <View style={styles.cameraIconBadge}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </View>
            {/* Zara Mascot Waiting State */}
            {/* [Animation Placeholder (Zara State: Idle)] */}
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleParent}
              activeOpacity={0.8}
            >
              <Text style={styles.familyIcon}>👨‍👩‍👧</Text>
              <Text style={styles.buttonText}>I’m the Parent</Text>
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
  bgBlobTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 384,
    height: 384,
    backgroundColor: '#eff6e7',
    borderRadius: 192,
    opacity: 0.8,
  },
  bgBlobBottom: {
    position: 'absolute',
    bottom: 48,
    right: -48,
    width: 320,
    height: 320,
    backgroundColor: '#94f68b',
    borderRadius: 160,
    opacity: 0.4,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 32,
    paddingBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.3)',
    shadowColor: '#2F8F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    transform: [{ translateY: 16 }],
  },
  illustrationArea: {
    width: 192,
    height: 192,
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
    backgroundColor: '#eff6e7',
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 64,
  },
  cameraIconBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: 12,
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e9f0e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cameraIcon: {
    fontSize: 24,
  },
  zaraImage: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 96,
    height: 96,
    borderRadius: 48,
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
    fontWeight: 'bold',
    color: '#2F8F2A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#006e09',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006e09',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  familyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
