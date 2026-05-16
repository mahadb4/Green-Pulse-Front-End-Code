import React, { useState } from 'react';
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

type GardenState = 'excellent' | 'poor';

export default function GardenScreen({ navigation }: any) {
  // Toggle this state to see the UI change (we can hook this to a backend later)
  const [gardenState, setGardenState] = useState<GardenState>('excellent');

  // Helper to toggle state just for demonstration
  const toggleState = () => {
    setGardenState(prev => prev === 'excellent' ? 'poor' : 'excellent');
  };

  const isHealthy = gardenState === 'excellent';

  // Dynamic UI properties based on garden state
  const uiData = {
    heroTitle: isHealthy ? 'Your Oasis is\nSprouting' : 'Your Garden\nNeeds Love',
    heroImage: isHealthy 
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkY5OTJ85LOH6sWvipq0Q74UVoqNtjG1dQI3eMf1SUl-xFRz8bjJkR1mOFtUJaf6e-XrB1gnUiYUCgRP8dnAoPTbhevxeYfPLzcM5Aeh2WqXsec_dkdFEuf7itqVK9vN--cetaZYA7y6TWfjO2yr8g0hwgQ6-pnBLQy-kkWpP9kaK0Peq0AeYyttw0oV9G9D1wUfanu3elXUV9Jb1VXUjAQE9PPJ2paYWzgk1ZB4nC01qTxHQKKAtCmqPEZ3GwSJ8Q0oCoZqfSv3w'
      : 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop', // Wilted plant placeholder
    healthLabel: isHealthy ? 'Excellent' : 'Needs Care',
    waterLevel: isHealthy ? '85%' : '20%',
    nutrients: isHealthy ? 'Balanced' : 'Low',
    communityText: isHealthy ? 'Your local squad is crushing it.' : 'Your squad can help you recover!',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* TopAppBar */}
      <View style={styles.topAppBar}>
        <View style={styles.appBarCenter}>
          <Text style={styles.appBarTitle}>GreenPulse</Text>
        </View>
        <View style={styles.appBarRight}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvX9iy5fbHMHsSA3AN8ghX6zZJY4fVHMn6Owu-Ycpw3gLpfy6Xk0H7KVmRgg89kno-aLGqSLSIg3DGhK1nXU0M3w-96KmhMtSWFnY3bED-qOkD8EHSaG511iwA5bEX9pKRjpJ4-swajCJrP6r6mtbSUkPK9Hl_BH-6pkjHeX_LZe9pOgLR9el3JHipm6NZF8yIq4yOBcufhUBk2deJwzkRrd4wZheUtkYuJMV_b6lALOV2-iNI_lAmD4LFkmdqQ9lcAaU3W607Vro' }}
            style={styles.profilePic}
          />
          <TouchableOpacity style={styles.notificationBtn}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        {/* Added onPress to easily test the state changes visually */}
        <TouchableOpacity activeOpacity={0.9} onPress={toggleState} style={styles.heroSection}>
          {/* Replace this Image with Three.js component later */}
          <Image 
            source={{ uri: uiData.heroImage }} 
            style={[styles.heroBgImage, !isHealthy && { opacity: 0.6 }]} 
            resizeMode="cover" 
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={[styles.levelBadge, !isHealthy && { backgroundColor: 'rgba(255, 218, 214, 0.95)' }]}>
              <Text style={styles.levelIcon}>{isHealthy ? '🌱' : '🍂'}</Text>
              <Text style={[styles.levelText, !isHealthy && { color: '#ba1a1a' }]}>Level 2 Garden</Text>
            </View>
            <Text style={styles.heroTitle}>{uiData.heroTitle}</Text>
          </View>
        </TouchableOpacity>

        {/* Metrics Bento Grid */}
        <View style={styles.grid}>
          {/* Health */}
          <View style={[styles.gridCard, !isHealthy && styles.gridCardError]}>
            <View style={[styles.iconCircle, { backgroundColor: isHealthy ? '#e9f0e1' : '#ffdad6' }]}>
              <Text style={styles.cardIcon}>{isHealthy ? '💚' : '💔'}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>HEALTH</Text>
              <Text style={[styles.cardValue, !isHealthy && { color: '#ba1a1a' }]}>{uiData.healthLabel}</Text>
            </View>
          </View>

          {/* Water */}
          <View style={[styles.gridCard, !isHealthy && styles.gridCardWarning]}>
            <View style={[styles.iconCircle, { backgroundColor: isHealthy ? '#eef6f9' : '#fff4e5' }]}>
              <Text style={styles.cardIcon}>💧</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>WATER LEVEL</Text>
              <Text style={[styles.cardValue, !isHealthy && { color: '#E35D5D' }]}>{uiData.waterLevel}</Text>
            </View>
          </View>

          {/* Nutrients (Spans full width) */}
          <View style={[styles.gridCard, styles.fullWidthCard]}>
            <View style={styles.nutrientLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isHealthy ? '#fcf3e8' : '#f5f5f5' }]}>
                <Text style={styles.cardIcon}>✨</Text>
              </View>
              <View style={styles.nutrientTextContainer}>
                <Text style={styles.cardLabel}>NUTRIENTS</Text>
                <Text style={[styles.cardValue, !isHealthy && { color: '#F4B400' }]}>{uiData.nutrients}</Text>
              </View>
            </View>
            
            {/* Mini bar chart */}
            <View style={styles.barChart}>
              <View style={[styles.bar, { height: '40%', backgroundColor: isHealthy ? '#e3ebdc' : '#ffdad6' }]} />
              <View style={[styles.bar, { height: isHealthy ? '80%' : '30%', backgroundColor: isHealthy ? '#b02263' : '#F4B400' }]} />
              <View style={[styles.bar, { height: '60%', backgroundColor: isHealthy ? '#e3ebdc' : '#ffdad6' }]} />
            </View>
          </View>
        </View>

        {/* Community Activity */}
        <View style={styles.communitySection}>
          <View style={styles.communityTextContent}>
            <Text style={styles.communityTitle}>Community Activity</Text>
            <Text style={styles.communityDesc}>{uiData.communityText}</Text>
          </View>
          <View style={styles.communityBadge}>
            <Text style={styles.fireIcon}>🔥</Text>
            <Text style={styles.communityBadgeText}>12 actions completed today</Text>
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
  topAppBar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(246, 247, 242, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#D8E1D3',
    zIndex: 50,
  },
  appBarCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E1D3',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  notificationIcon: {
    fontSize: 20,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  heroSection: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  heroBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(23, 29, 20, 0.4)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 24,
    width: '100%',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(238, 242, 234, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  levelIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  levelText: {
    color: '#006e09',
    fontSize: 14,
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 44,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    width: '47%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
    justifyContent: 'space-between',
    height: 140,
  },
  gridCardError: {
    borderColor: 'rgba(186, 26, 26, 0.3)',
    backgroundColor: '#fffaf9',
  },
  gridCardWarning: {
    borderColor: 'rgba(227, 93, 93, 0.3)',
    backgroundColor: '#fffaf9',
  },
  fullWidthCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#68756B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  nutrientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nutrientTextContainer: {
    marginLeft: 16,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    width: 64,
    gap: 6,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
  },
  communitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  communityTextContent: {
    marginBottom: 16,
  },
  communityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
  },
  communityDesc: {
    fontSize: 16,
    color: '#68756B',
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7F2',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
  },
  fireIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  communityBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  bottomNav: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D8E1D3',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  navItem: {
    width: 72,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  navItemActive: {
    width: 72,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(56, 173, 50, 0.15)',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  navIconActive: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#68756B',
    fontWeight: '600',
  },
  navTextActive: {
    fontSize: 12,
    color: '#006e09',
    fontWeight: 'bold',
  }
});
