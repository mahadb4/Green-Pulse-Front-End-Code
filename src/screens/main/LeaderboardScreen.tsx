import React, { useState } from 'react';
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

// Types for backend integration
export type LeaderboardUser = {
  id: string;
  rank: number;
  name: string;
  score: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  subtext?: string;
};

// Mock data (replace with backend API call later)
const topThree: LeaderboardUser[] = [
  { 
    id: '1', 
    rank: 1, 
    name: 'LeafLeader', 
    score: 5120, 
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM4a-5th3Tsv9MDiADcVzX1lbXp5UvHYuc66-1Hlu0yp9eNBS--RZYg7kH-R08sJaPUAVxLs1A0_tRfIVz-mA-8cLl1ujT5KLU58sXn6CiT-sLQ7v2i_ggYYPglsNGsuesMVLWYF5UyvCBHAtQV7zWCsBaJgQTiZlHbneZFMA6igJ78YJKd2lZK2BOgdKaxTthr14zVcShWk7Qpm_h_z5jo6QGiwQ0S5-Ufr88dxnFlGolfQ5gQ58ZNkAK16rE9iFEqDuFAKmwzrI',
    subtext: 'Top 1%'
  },
  { 
    id: '2', 
    rank: 2, 
    name: 'EcoNinja', 
    score: 4250, 
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHX8retKiPcLAPsfJ_9nc3i8mI-cwUeQPFrDpY-vMQBXtkufqQVqq9aKb_EC-asfJCLGFhey11BlnFwLdTn0jS8-sV8eYIpMz7ne3ZWXz3Vy83s_Yfdb64jyvikMgISrLS2qRulX72cYPmztwadUEjV8lKikrgcRltHEVc9eyf1uWmjPxhKb-9mvV_rla8i4qtaADCvnllj-Xun-ZUgOgBJXakK2_dib0-Jo1nSOAZ4Xi7kBkaWpZ4Suv3d0OQzkdwoFoXItG71T0'
  },
  { 
    id: '3', 
    rank: 3, 
    name: 'Sprout', 
    score: 3980, 
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIa9POvtxssg0FF4oThVvN6prSRJrQ283g2XpwptLgHieP60RIs4H3UuWaZoz8zPQH2xmoXr2fjZaWPW90CojObTWkTpkwdjTlIsLwauRO5sILSgevSdheL_y_8qZkCkJF34eISUvXGdR5OyDnxXkoWZuTS-rgHzrByGtsHYuZk5UpIyRBwQVG3MeMFF-s29NBeH3VQftz9rwX-t-KipxVp85_vzhE8JvoC-wFK_y-LLo85YHqrbTc4cpLbBuAkhI-v7Ff2G_zaTo'
  },
];

const remainingList: LeaderboardUser[] = [
  {
    id: '4',
    rank: 4,
    name: 'GreenThumb',
    score: 3450,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtASkIfuqwXjQgY5IpW5dnRxMSn5XA3gykHwCeGHkKUTPzzwiAdKAawrwe7X5i2KX0KjGhg9wn8DMwQvJ7bs0P1iAXuqpYeMScQCRUdFzltLD5v223oQl_MQY8ddaXocaShidP3ZTJ5Ec3ApdFKd_33e0hUMWg76Rw7ANijrHJBD0iMeccMfK6PeGlH7kNM1MKN4nU1-C7t9j7y1CzvrODFRms0yKGcohjYPgITQmZiWormnYJYCvVskQqRVePTjmnbv-4vGqyENk',
    subtext: 'Class 4B'
  },
  {
    id: '5',
    rank: 5,
    name: 'You',
    score: 3120,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzGO99f_IPuccWm92nhsbzEBEn3cPkFdbMS92Y_8c5k8aLQhwiCC8EKZ_dL0-MVy0w0_hDTW5iez7ofa--jU96l_YHtAGSXzXltDXRltjeyO1gLkYzI72sX3kTkE-At4Q4krVwTalS6cngOwRtq3WpqIdJvnFxpXboJRiITWv7zU-NZLHb_0nRQBgP8_eViSOMzzQN8EQ0AFoHQy6BgMGX_8uOW3RKUKB-g_QtMO0R-LK5kfSiixH4eJTJWEGTx2lDWeKfbaY3Cx8',
    isCurrentUser: true,
    subtext: 'Class 4B'
  },
  {
    id: '6',
    rank: 6,
    name: 'SunSeeker',
    score: 2890,
    subtext: 'Class 4A'
  }
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState('Class');
  const tabs = ['Class', 'School', 'Neighborhood', 'Friends'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      
      {/* Top App Bar */}
      <View style={styles.topAppBar}>
        <View style={styles.appBarAvatar}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ0cuse53ned7zCSeur5pOfAQlOsz_Qr5ILDJn9MAdEkpyZGv3I3S1X_SNIkVOxbpfFeRqbmsqwwJ2udu90BLUJvXz6PJt-hEDEOhPG1LEcE7FwetBZAgtCPqAkk5dBU6qYUc5wYqlk4My3eKkC3PtPaigvEDQB0cRWxmhG7o4ohhFkaz57EP8SUFsulYjiKKJs3F59qiLFBcGiplhhN0T-8VrO7VakSdP887jiDnMnQeChozGKO1h5PKKP8iUUuSx2-ZYSq3YZdk' }}
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
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Top Eco Heroes</Text>
          <Text style={styles.pageSubtitle}>See who's leading the charge for a greener tomorrow.</Text>
        </View>

        {/* Tabs Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScroll}
        >
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Podium (Top 3) */}
        <View style={styles.podiumContainer}>
          {/* Rank 2 - EcoNinja */}
          <View style={[styles.podiumCard, styles.podiumSecond]}>
            <View style={styles.podiumAvatarWrapper}>
              <Image source={{ uri: topThree[1].avatarUrl }} style={styles.podiumAvatar} />
            </View>
            <View style={[styles.podiumRankBadge, { backgroundColor: '#E0E0E0' }]}>
              <Text style={styles.podiumRankText}>2</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{topThree[1].name}</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeIcon}>⚡</Text>
              <Text style={styles.scoreBadgeText}>{topThree[1].score}</Text>
            </View>
          </View>

          {/* Rank 1 - LeafLeader */}
          <View style={[styles.podiumCard, styles.podiumFirst]}>
            <View style={styles.crownIconContainer}>
              <Text style={styles.crownIcon}>👑</Text>
            </View>
            <View style={[styles.podiumAvatarWrapper, styles.podiumAvatarFirstWrapper]}>
              <Image source={{ uri: topThree[0].avatarUrl }} style={styles.podiumAvatar} />
            </View>
            <View style={[styles.podiumRankBadge, styles.rankBadgeFirst]}>
              <Text style={styles.podiumRankTextFirst}>1</Text>
            </View>
            <Text style={styles.podiumNameFirst} numberOfLines={1}>{topThree[0].name}</Text>
            <View style={styles.scoreBadgeFirst}>
              <Text style={styles.scoreBadgeIconFirst}>⚡</Text>
              <Text style={styles.scoreBadgeTextFirst}>{topThree[0].score}</Text>
            </View>
            {topThree[0].subtext && (
              <View style={styles.topPercentBadge}>
                <Text style={styles.topPercentText}>{topThree[0].subtext}</Text>
              </View>
            )}
          </View>

          {/* Rank 3 - Sprout */}
          <View style={[styles.podiumCard, styles.podiumThird]}>
            <View style={styles.podiumAvatarWrapper}>
              <Image source={{ uri: topThree[2].avatarUrl }} style={styles.podiumAvatar} />
            </View>
            <View style={[styles.podiumRankBadge, { backgroundColor: '#CD7F32' }]}>
              <Text style={[styles.podiumRankText, { color: '#ffffff' }]}>3</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{topThree[2].name}</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeIcon}>⚡</Text>
              <Text style={styles.scoreBadgeText}>{topThree[2].score}</Text>
            </View>
          </View>
        </View>

        {/* Remaining List */}
        <View style={styles.listContainer}>
          {remainingList.map((user) => {
            const isMe = user.isCurrentUser;
            return (
              <View 
                key={user.id} 
                style={[
                  styles.listItem, 
                  isMe && styles.listItemActive
                ]}
              >
                {isMe && <View style={styles.activeIndicator} />}
                
                <Text style={[styles.listRank, isMe && styles.listRankActive]}>
                  {user.rank}
                </Text>
                
                <View style={[styles.listAvatarContainer, isMe && styles.listAvatarContainerActive]}>
                  {user.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.listAvatar} />
                  ) : (
                    <Text style={{ fontSize: 24, color: '#68756B' }}>👤</Text>
                  )}
                </View>

                <View style={styles.listTextContent}>
                  <Text style={[styles.listName, isMe && styles.listNameActive]}>
                    {user.name}
                  </Text>
                  {user.subtext && (
                    <Text style={styles.listSubtext}>{user.subtext}</Text>
                  )}
                </View>

                <View style={[styles.listScoreBadge, isMe && styles.listScoreBadgeActive]}>
                  <Text style={[styles.listScoreText, isMe && styles.listScoreTextActive]}>
                    {user.score}
                  </Text>
                  <Text style={[styles.listScoreIcon, isMe && styles.listScoreIconActive]}>⚡</Text>
                </View>
              </View>
            );
          })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(246, 247, 242, 0.9)',
    zIndex: 10,
  },
  appBarAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#38ad32',
    overflow: 'hidden',
    backgroundColor: '#e3ebdc',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#006e09',
    letterSpacing: -0.5,
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
  pageHeader: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
  },
  tabsScroll: {
    marginBottom: 32,
  },
  tabsContainer: {
    paddingRight: 20, // To allow scrolling fully
    gap: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8E1D3',
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#38ad32',
    borderWidth: 0,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(56, 173, 50, 0.2)',
      },
      default: {
        shadowColor: '#38ad32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  tabText: {
    color: '#68756B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 280,
    marginBottom: 32,
  },
  podiumCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.5)',
  },
  podiumSecond: {
    height: 200,
    paddingBottom: 16,
  },
  podiumFirst: {
    height: 240,
    paddingBottom: 20,
    borderColor: 'rgba(244, 180, 0, 0.3)',
    borderWidth: 2,
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 20px rgba(244, 180, 0, 0.1)',
      },
      default: {
        shadowColor: '#F4B400',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
    zIndex: 10,
  },
  podiumThird: {
    height: 180,
    paddingBottom: 16,
  },
  podiumAvatarWrapper: {
    position: 'absolute',
    top: -36,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    backgroundColor: '#EEF2EA',
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
    overflow: 'hidden',
  },
  podiumAvatarFirstWrapper: {
    top: -44,
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
  },
  podiumRankBadge: {
    position: 'absolute',
    top: -44,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 20,
  },
  rankBadgeFirst: {
    top: -32,
    right: -4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4B400',
    borderWidth: 3,
  },
  podiumRankText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#757575',
  },
  podiumRankTextFirst: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
  },
  crownIconContainer: {
    position: 'absolute',
    top: -72,
    zIndex: 20,
    ...Platform.select({
      web: {
        textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
    }),
  },
  crownIcon: {
    fontSize: 40,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginTop: 40,
  },
  podiumNameFirst: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginTop: 56,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 110, 9, 0.1)', // primary/10
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginTop: 8,
  },
  scoreBadgeFirst: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 173, 50, 0.1)', // primary-container/10
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  scoreBadgeIcon: {
    fontSize: 14,
    color: '#006e09',
    marginRight: 4,
  },
  scoreBadgeIconFirst: {
    fontSize: 16,
    color: '#38ad32',
    marginRight: 4,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006e09',
  },
  scoreBadgeTextFirst: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38ad32',
  },
  topPercentBadge: {
    backgroundColor: '#e3ebdc',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  topPercentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#006e17',
    textTransform: 'uppercase',
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(216, 225, 211, 0.3)',
  },
  listItemActive: {
    backgroundColor: '#eff6e7', // surface-container-low
    borderColor: 'rgba(56, 173, 50, 0.4)',
    overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#38ad32',
  },
  listRank: {
    width: 40,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#68756B',
    opacity: 0.7,
    textAlign: 'center',
    marginRight: 8,
  },
  listRankActive: {
    color: '#38ad32',
    opacity: 1,
    paddingLeft: 4, // Make room for active indicator
  },
  listAvatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2EA',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  listAvatarContainerActive: {
    borderColor: '#38ad32',
  },
  listAvatar: {
    width: '100%',
    height: '100%',
  },
  listTextContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2A1F',
  },
  listNameActive: {
    color: '#1F2A1F',
  },
  listSubtext: {
    fontSize: 13,
    color: '#68756B',
    marginTop: 2,
  },
  listScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 110, 9, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  listScoreBadgeActive: {
    backgroundColor: 'rgba(56, 173, 50, 0.1)',
  },
  listScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006e09',
    marginRight: 4,
  },
  listScoreTextActive: {
    color: '#38ad32',
  },
  listScoreIcon: {
    fontSize: 16,
    color: '#006e09',
  },
  listScoreIconActive: {
    color: '#38ad32',
  }
});
