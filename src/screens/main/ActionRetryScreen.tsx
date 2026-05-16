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

export default function ActionRetryScreen({ navigation }: any) {

  const handleTryAgain = () => {
    // Navigate back to the Camera screen to retake the photo
    if (navigation && navigation.navigate) {
      navigation.navigate('Camera');
    }
  };

  const handleCancel = () => {
    // Return to the Garden home
    if (navigation && navigation.navigate) {
      navigation.navigate('Garden');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GreenPulse</Text>
      </View>

      <View style={styles.contentWrapper}>
        {/* Main Card Container */}
        <View style={styles.mainCard}>
          
          {/* Illustration */}
          <View style={styles.mascotContainer}>
            <View style={styles.glowEffect} />
            {/* Mascot Placeholder for 3D sad Zara */}
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7fRaphkEV5-cbpjNjIQlPCwHWA0Ch1MrjftoBLOZvHtLSNf-JPdYSFfw-NyKofOH52HxJ5dYyd0FfVBuzJc3ZdNOw-M9TZ8Do2bTbghUasWfFJYKGCtyE5CJOu1wLnNW861RUzkIZkDj_7cnEukDIb7UH5MR755WOklVlhqfumFpZawHRIY7ZqbVTbM8fswhYSU_wf6RQ5D-2cpoUAlsKDWgQSssHVaW_ZXrU8C6nx6GGKw5FddsZffziOPq2TVPs1tLdSu4PaEE' }}
              style={styles.mascotImage}
              resizeMode="cover"
            />
            {/* Floating Error Icon */}
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textSection}>
            <Text style={styles.title}>Oops! Let’s try that again.</Text>
            <Text style={styles.subtitle}>Make sure the photo is clear.</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleTryAgain}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonIconPrimary}>↻</Text>
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
    zIndex: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mainCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 16px 48px rgba(0, 110, 9, 0.08)',
      },
      default: {
        shadowColor: '#006e09',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.08,
        shadowRadius: 48,
        elevation: 10,
      },
    }),
  },
  mascotContainer: {
    width: 224,
    height: 224,
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 218, 214, 0.3)', // error-container/30
    borderRadius: 112,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 112,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(186, 26, 26, 0.08)',
      },
      default: {
        shadowColor: '#ba1a1a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
    }),
    zIndex: 10,
  },
  errorIconContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
    zIndex: 20,
  },
  errorIcon: {
    fontSize: 24,
    color: '#ba1a1a',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#68756B',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 32,
    backgroundColor: '#38ad32', // primary-container
    borderRadius: 999, // full pill
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(56, 173, 50, 0.15)',
      },
      default: {
        shadowColor: '#38ad32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
    marginBottom: 8,
  },
  buttonIconPrimary: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#68756B',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
