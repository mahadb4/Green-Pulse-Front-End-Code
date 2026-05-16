import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';

export default function ActionSuccessScreen({ navigation, route }: any) {
  const { points = 50 } = route.params || {};

  const handleReturn = () => {
    // Navigate back to the main Garden home tab
    if (navigation && navigation.navigate) {
      navigation.navigate('Main');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      
      {/* Ambient Background Elements */}
      <View style={styles.ambientTopLeft} />
      <View style={styles.ambientBottomRight} />
      <View style={styles.ambientCenter} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>GreenPulse</Text>
          </View>

          {/* Mascot Hero Image */}
          <View style={styles.mascotContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl-dUCgnqlobtpjbLw9AMT_QYJbplMOW_xrlObp9FhKeR6OynLnIIeSaWod4h7_Omk6pExhJTvU0lC8lbzjjPk0nKgxRfewfbNJKRtQeYom2GZ35AH1kKw3G5hwhH5CMlyr72XjXyWZay_qj2vdGGnT3iUejHi9ygKVYhEJH4snOLeggBIG01bZcxi-mJilhwS7WHGQavTK4kjXzsaKGGAQ8LqksSD7EyGuZ9YJY9T2yDR50hcplg3L8lC8P__BAdnjH_LcQ4djH0' }}
              style={styles.mascotImage}
              resizeMode="cover"
            />
          </View>

          {/* Text Content */}
          <View style={styles.textSection}>
            <Text style={styles.title}>Awesome Job!</Text>
            <Text style={styles.subtitle}>
              You've completed your daily action. Your garden is thriving thanks to you.
            </Text>
          </View>

          {/* Reward Card */}
          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>REWARD UNLOCKED</Text>
            
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsIcon}>⚡</Text>
              <Text style={styles.pointsValue}>+{points}</Text>
            </View>
            <Text style={styles.pointsText}>Energy Points</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.boostContainer}>
              <View style={styles.boostLeft}>
                <View style={styles.boostIconCircle}>
                  <Text style={styles.boostIcon}>🌱</Text>
                </View>
                <View>
                  <Text style={styles.boostLabel}>Garden Boost</Text>
                  <Text style={styles.boostValue}>Level 4 Growth</Text>
                </View>
              </View>
              <Text style={styles.trendingIcon}>📈</Text>
            </View>
          </View>

          {/* CTA Action */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleReturn}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Return to Garden</Text>
            <Text style={styles.buttonIconPrimary}>➔</Text>
          </TouchableOpacity>
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
  ambientTopLeft: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 128,
    height: 128,
    backgroundColor: '#87fc77',
    opacity: 0.15,
    borderRadius: 64,
  },
  ambientBottomRight: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    width: 192,
    height: 192,
    backgroundColor: '#94f68b',
    opacity: 0.2,
    borderRadius: 96,
  },
  ambientCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -192,
    marginTop: -192,
    width: 384,
    height: 384,
    backgroundColor: '#f5fced',
    opacity: 0.4,
    borderRadius: 192,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 24,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
    paddingTop: 20,
  },
  innerContent: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  mascotContainer: {
    width: 180,
    height: 180,
    marginBottom: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 128,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(0, 110, 9, 0.1)',
      },
      default: {
        shadowColor: '#006e09',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
    }),
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#006e09',
    marginBottom: 8,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
  },
  rewardCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 30,
        elevation: 4,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.3)',
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#68756B',
    letterSpacing: 2,
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pointsIcon: {
    fontSize: 48,
    color: '#F4B400',
    marginRight: 12,
  },
  pointsValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1F2A1F',
    lineHeight: 64,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginTop: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(216, 225, 211, 0.6)',
    marginVertical: 16,
  },
  boostContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boostIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e9f0e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  boostIcon: {
    fontSize: 24,
    color: '#006e09',
  },
  boostLabel: {
    fontSize: 14,
    color: '#68756B',
  },
  boostValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  trendingIcon: {
    fontSize: 28,
    color: '#4CAF50',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#006e09',
    borderRadius: 30, // fully rounded pill
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 14px rgba(0, 110, 9, 0.4)',
      },
      default: {
        shadowColor: '#006e09',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
      },
    }),
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIconPrimary: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
