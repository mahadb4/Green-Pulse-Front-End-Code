import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform
} from 'react-native';

// --- Types for Backend Integration ---

export type UserProfile = {
  name: string;
  title: string;
  avatarUrl: string;
  energyPoints: number;
  level: number;
  nextLevel: number;
  nextLevelXp: number;
  progressPercent: number;
  dailyStreak: number;
  ecoImpact: number;
};

export type Badge = {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  isLocked: boolean;
};

export type Activity = {
  id: string;
  title: string;
  points: number;
  subtitle?: string;
  time: string;
  dotColor: string;
  isFaded?: boolean;
};

// --- Mock Data (Replace with API calls later) ---

const mockProfile: UserProfile = {
  name: 'Alex Green',
  title: 'Sprouting Botanist',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj11HNDFqGUxCf2jEthWsv9EWBKZ64sKKdfO9_yv7DFlOUAyFpd1kJoPvChUaeoTn6QAEdOUeMWrPs4Et3PNMj6PJ-m-j-_kW0S_bk6r7ARG2pMfiEzR0V8YCpNDoHWoV4f90YonoWTYzg6EIPx3zNeIG_oX0Ib-hhBx6ua4Jr6OZqvljL4mUoCsominey1vq9ZRaxH7j3shoJoWN7-GBXk4rMNMFzrM3gt-ObVnEtkaKht5fujGX9ykI4oh5ay-G_tL4-oYsQKQU',
  energyPoints: 2450,
  level: 12,
  nextLevel: 13,
  nextLevelXp: 3000,
  progressPercent: 82,
  dailyStreak: 14,
  ecoImpact: 128,
};

const mockBadges: Badge[] = [
  { id: '1', title: 'Seed\nStarter', icon: '🌱', color: '#2F8F2A', bgColor: '#EEF2EA', isLocked: false },
  { id: '2', title: 'Forest\nGuardian', icon: '🌳', color: '#b02263', bgColor: 'rgba(176, 34, 99, 0.1)', isLocked: false },
  { id: '3', title: 'Solar\nSaver', icon: '☀️', color: '#F4B400', bgColor: 'rgba(244, 180, 0, 0.1)', isLocked: false },
  { id: '4', title: 'Water\nWizard', icon: '💧', color: 'rgba(104, 117, 107, 0.5)', bgColor: 'rgba(222, 229, 214, 0.5)', isLocked: true },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Logged a Zero-Waste Lunch',
    points: 15,
    time: 'Today, 1:30 PM',
    dotColor: '#006e09',
  },
  {
    id: '2',
    title: 'Completed "Walk instead of Drive" Challenge',
    points: 50,
    subtitle: 'Earned Forest Guardian Badge',
    time: 'Yesterday',
    dotColor: '#006e09',
  },
  {
    id: '3',
    title: 'Recycled Electronic Waste',
    points: 30,
    time: 'Oct 12, 2023',
    dotColor: '#dee5d6', // surface-variant
    isFaded: true,
  }
];

export default function ProfileScreen({ navigation }: any) {

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />

      {/* Top App Bar */}
      <View style={styles.topAppBar}>
        <View style={styles.appBarAvatar}>
          <Image 
            source={{ uri: mockProfile.avatarUrl }}
            style={styles.avatarImage}
          />
        </View>
        <Text style={styles.appBarTitle}>GreenPulse</Text>
        <TouchableOpacity style={styles.appBarIcon}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.largeAvatarContainer}>
            <Image 
              source={{ uri: mockProfile.avatarUrl }}
              style={styles.largeAvatar}
            />
            {/* Garden Stage Badge */}
            <View style={styles.stageBadge}>
              <Text style={{ fontSize: 16 }}>🪴</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{mockProfile.name}</Text>
            <View style={styles.titleRow}>
              <Text style={styles.titleIcon}>🌿</Text>
              <Text style={styles.profileTitle}>{mockProfile.title}</Text>
            </View>
          </View>
        </View>

        {/* Bento Grid Stats */}
        <View style={styles.statsGrid}>
          {/* Energy Points (Spans Full Width basically, but acts as 2 cols in CSS, here we use full width) */}
          <View style={styles.energyCard}>
            <View style={styles.energyHeader}>
              <View>
                <Text style={styles.statLabel}>ENERGY POINTS</Text>
                <View style={styles.energyValueRow}>
                  <Text style={styles.energyValue}>{mockProfile.energyPoints.toLocaleString()}</Text>
                  <Text style={styles.energyUnit}>XP</Text>
                </View>
              </View>
              <View style={styles.boltIconContainer}>
                <Text style={styles.boltIcon}>⚡</Text>
              </View>
            </View>
            
            <View style={styles.levelProgressContainer}>
              <View style={styles.levelRow}>
                <Text style={styles.levelText}>Level {mockProfile.level}</Text>
                <Text style={styles.levelText}>Level {mockProfile.nextLevel} ({mockProfile.nextLevelXp.toLocaleString()} XP)</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${mockProfile.progressPercent}%` }]} />
              </View>
            </View>
          </View>

          {/* Bottom Row of Stats */}
          <View style={styles.statsBottomRow}>
            {/* Daily Streak */}
            <View style={styles.smallStatCard}>
              <View style={[styles.smallStatIconContainer, { backgroundColor: 'rgba(244, 180, 0, 0.1)' }]}>
                <Text style={styles.smallStatIcon}>🔥</Text>
              </View>
              <Text style={styles.statLabel}>DAILY STREAK</Text>
              <View style={styles.smallStatValueRow}>
                <Text style={styles.smallStatValue}>{mockProfile.dailyStreak}</Text>
                <Text style={styles.smallStatUnit}>Days</Text>
              </View>
            </View>

            {/* Eco Impact */}
            <View style={styles.smallStatCard}>
              <View style={[styles.smallStatIconContainer, { backgroundColor: 'rgba(148, 246, 139, 0.3)' }]}>
                <Text style={styles.smallStatIcon}>🌍</Text>
              </View>
              <Text style={styles.statLabel}>ECO IMPACT</Text>
              <View style={styles.smallStatValueRow}>
                <Text style={styles.smallStatValue}>{mockProfile.ecoImpact}</Text>
                <Text style={styles.smallStatUnit}>Actions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badge Collection */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badge Collection</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgesGrid}>
            {mockBadges.map((badge) => (
              <View 
                key={badge.id} 
                style={[
                  styles.badgeCard,
                  badge.isLocked && styles.badgeCardLocked
                ]}
              >
                <View style={[styles.badgeIconContainer, { backgroundColor: badge.bgColor }]}>
                  <Text style={[styles.badgeIcon, badge.isLocked && { opacity: 0.5 }]}>
                    {badge.icon}
                  </Text>
                </View>
                <Text 
                  style={[
                    styles.badgeText,
                    badge.isLocked && styles.badgeTextLocked,
                    { textAlign: 'center' }
                  ]}
                >
                  {badge.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity History */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Activity History</Text>
          <View style={styles.historyCard}>
            <View style={styles.timelineLine} />
            
            <View style={styles.timelineContent}>
              {mockActivities.map((activity) => (
                <View key={activity.id} style={styles.timelineItem}>
                  {/* Dot */}
                  <View 
                    style={[
                      styles.timelineDot, 
                      { backgroundColor: activity.dotColor }
                    ]} 
                  />
                  {/* Text Content */}
                  <View style={styles.timelineTextContainer}>
                    <Text style={[styles.timelineItemTitle, activity.isFaded && styles.fadedText]}>
                      {activity.title}
                    </Text>
                    <Text style={[styles.timelineItemSubtitle, activity.isFaded && styles.fadedText]}>
                      +{activity.points} Energy Points
                      {activity.subtitle ? ` • ${activity.subtitle}` : ''}
                    </Text>
                    <Text style={[styles.timelineItemTime, activity.isFaded && styles.fadedText]}>
                      {activity.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.viewHistoryButton}>
              <Text style={styles.viewHistoryButtonText}>View Full History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Temporary Parent Dashboard Link */}
        <TouchableOpacity 
          style={styles.parentLink}
          onPress={() => {
            console.log('Navigating to ParentDashboard...');
            navigation.navigate('ParentDashboard');
          }}
        >
          <Text style={styles.parentLinkIcon}>🛡️</Text>
          <Text style={styles.parentLinkText}>Switch to Parent Mode</Text>
        </TouchableOpacity>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F6F7F2',
    zIndex: 10,
  },
  appBarAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dee5d6',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
  },
  appBarIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeAvatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  largeAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  stageBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#94f68b', // secondary-container
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 20,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  titleIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  profileTitle: {
    fontSize: 16,
    color: '#68756B',
  },
  statsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  energyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF2EA',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  energyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#68756B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  energyValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  energyValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#006e09',
  },
  energyUnit: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#68756B',
    marginLeft: 6,
  },
  boltIconContainer: {
    backgroundColor: 'rgba(56, 173, 50, 0.1)',
    padding: 10,
    borderRadius: 20,
  },
  boltIcon: {
    fontSize: 20,
  },
  levelProgressContainer: {
    width: '100%',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#68756B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#EEF2EA',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#006e09',
    borderRadius: 5,
  },
  statsBottomRow: {
    flexDirection: 'row',
    gap: 16,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2EA',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  smallStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  smallStatIcon: {
    fontSize: 24,
  },
  smallStatValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  smallStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  smallStatUnit: {
    fontSize: 14,
    color: '#68756B',
    marginLeft: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 16, // If no header flex
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#006e09',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '22%', // approx 4 per row
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2EA',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  badgeCardLocked: {
    backgroundColor: 'rgba(238, 242, 234, 0.5)', // surface-soft/50
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2A1F',
    textAlign: 'center',
  },
  badgeTextLocked: {
    color: 'rgba(104, 117, 107, 0.6)', // text-secondary/60
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF2EA',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 26,
    top: 36,
    bottom: 80, // stop before the button
    width: 2,
    backgroundColor: '#dee5d6', // surface-variant
  },
  timelineContent: {
    paddingLeft: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 24,
  },
  timelineDot: {
    position: 'absolute',
    left: -24,
    top: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ translateX: -7 }], // Center on the line
    zIndex: 10,
  },
  timelineTextContainer: {
    paddingLeft: 8,
  },
  timelineItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 2,
  },
  timelineItemSubtitle: {
    fontSize: 13,
    color: '#68756B',
  },
  timelineItemTime: {
    fontSize: 11,
    color: '#68756B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  fadedText: {
    opacity: 0.7,
  },
  viewHistoryButton: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D8E1D3',
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  viewHistoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006e09',
  },
  parentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2EA',
    borderWidth: 1,
    borderColor: '#D8E1D3',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  parentLinkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  parentLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
  }
});
