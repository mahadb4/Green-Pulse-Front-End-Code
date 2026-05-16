import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';

export default function PhotoPreviewScreen({ route, navigation }: any) {
  const { photoPath, photoUri, points } = route.params || {};
  
  // High quality placeholder fallback
  const fallbackImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDd_zkSyKb9vBccCVLDBwmy8b_o7HpssEqy1DTzH-rvfVv7yAIzzE_j2BPoFa-tP-gJsfKoZhRNtPjm_Vrv9n1rz468XclxPJz6avmBWWo3c_tGCXUE3mfTl-9YTJVd4MwlIf4yYKwILPhNFaBuGXjRduTaPBvgYM43hTpQo-9A3G3Q8FwiI8UP2bcfU1LKDZT4DqdgC5kuWyJbqTf2Q0GLopKy8wm1Tsv6Rc4gIb-8rD-ZRiVDQ9CCi_R5K6X0EzEIbrmFH0YryHM';

  const getImageSource = () => {
    if (photoUri) return { uri: photoUri };
    if (photoPath) {
      if (photoPath.startsWith('http')) return { uri: photoPath };
      return { uri: `file://${photoPath}` };
    }
    return { uri: fallbackImage };
  };

  const imageSource = getImageSource();

  const handleClose = () => {
    navigation.goBack();
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  const handleConfirm = () => {
    // Navigate to next screen (Processing)
    if (navigation && navigation.navigate) {
      navigation.navigate('Processing', { points });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* The Captured Image (Background) */}
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* Gradient Scrim for Legibility */}
        <View style={styles.scrim} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header Layer */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Action Card */}
        <View style={styles.bottomCard}>
          <View style={styles.contentContainer}>
            <View style={styles.textSection}>
              <Text style={styles.title}>Looking Good?</Text>
              <Text style={styles.subtitle}>Make sure the plant is clearly visible and in focus.</Text>
            </View>

            <View style={styles.buttonContainer}>
              {/* Primary CTA: Looks Good */}
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Looks Good</Text>
                <Text style={styles.buttonIconPrimary}>✓</Text>
              </TouchableOpacity>

              {/* Secondary CTA: Retake */}
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleRetake}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonIconSecondary}>↺</Text>
                <Text style={styles.secondaryButtonText}>Retake</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171d14',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(23, 29, 20, 0.4)', // Simulating the gradient scrim
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'flex-start',
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(238, 242, 234, 0.8)', // surface-soft/80
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#1F2A1F',
  },
  bottomCard: {
    backgroundColor: '#F6F7F2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px -8px 30px rgba(0, 0, 0, 0.12)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 30,
        elevation: 20,
      },
    }),
  },
  contentContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  textSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#68756B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 26,
  },
  buttonContainer: {
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#006e09',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 110, 9, 0.3)',
      },
      default: {
        shadowColor: '#006e09',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  buttonIconPrimary: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#D8E1D3',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1F2A1F',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  buttonIconSecondary: {
    color: '#1F2A1F',
    fontSize: 24,
  }
});
