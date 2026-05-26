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
  Platform
} from 'react-native';
import BrandHeader from '../../components/BrandHeader';

export default function ActionDetailScreen({ navigation }: any) {
  // Mock points for this action (In real app, this would come from a DB/Props)
  const actionPoints = 75;

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
      <View style={styles.mainContent}>
        {/* Header / Logo */}
        <BrandHeader style={styles.header} />

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
              <Text style={styles.exampleIcon}>📸</Text>
              <Text style={styles.exampleLabel}>VERIFICATION EXAMPLE</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJar_BQwSvv92Z-HpoTzkP6Tb2vbiwkSZ-NvE7LbYyzxs3-tUJ7vlAtONC8cDdGOrwVaK88At9KmB8bE_KbXiKXK04mxYMhz-J_W8ahySnjkkRa4CurlnUbtUpL6ls_MFpkWQAr5jD3-JvqoHCIWT933hmYWDwySi8sSlzsf93OTGm36PC5X5seYci0eKbKdyjCnQoK0oIvN-eZkwUl3rqAuQcqyqNdB13a-ceDaN78wX7o2VnNN26aLRxRtKM1brOhX3hRxKsRMQ' }}
                style={styles.exampleImage}
                resizeMode="cover"
              />
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
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleOpenCamera}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5dcce', // surface-dim
  },
  mainContent: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 225, 211, 0.3)',
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  exampleSection: {
    backgroundColor: '#EEF2EA',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
    marginBottom: 32,
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
    fontSize: 11,
    fontWeight: 'bold',
    color: '#68756B',
    letterSpacing: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#dee5d6',
  },
  exampleImage: {
    width: '100%',
    height: '100%',
  },
  tipsSection: {
    paddingHorizontal: 4,
  },
  tipsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 4,
  },
  tipsDivider: {
    width: 32,
    height: 4,
    backgroundColor: 'rgba(0, 110, 9, 0.2)',
    borderRadius: 2,
  },
  tipsList: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#eff6e7', // surface-container-low
    borderRadius: 16,
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
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 14,
    color: '#68756B',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(190, 202, 182, 0.2)',
    ...Platform.select({
      web: {
        boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  primaryButton: {
    backgroundColor: '#006e09',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
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
  },
  buttonIcon: {
    fontSize: 22,
    marginRight: 8,
    color: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
