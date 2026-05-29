import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../../firebase';
import { listenToLeaderboard, LeaderboardEntry } from '../../services/gardenService';
import BrandHeader from '../../components/BrandHeader';

// Deterministic colour per name so avatars stay stable across renders.
const AVATAR_COLORS = ['#16A34A', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6', '#EC4899', '#65A30D'];
function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name.trim().slice(0, 2) || '?').toUpperCase();
}

function InitialsAvatar({ name, size }: { name: string; size: number }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: colorFor(name), alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: size * 0.4 }}>{initials(name)}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid ?? '';

  useEffect(() => {
    const unsub = listenToLeaderboard(50, (data) => {
      setRows(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const myIndex = rows.findIndex((r) => r.uid === uid);
  const myRank = myIndex >= 0 ? myIndex + 1 : null;

  const hasPodium = rows.length >= 3;
  const podium = hasPodium ? rows.slice(0, 3) : [];
  const listRows = hasPodium ? rows.slice(3) : rows;

  const renderPodiumCard = (entry: LeaderboardEntry, rank: number) => {
    const isFirst = rank === 1;
    const isMe = entry.uid === uid;
    return (
      <View
        style={[
          styles.podiumCard,
          rank === 1 ? styles.podiumFirst : rank === 2 ? styles.podiumSecond : styles.podiumThird,
        ]}
      >
        {isFirst && (
          <View style={styles.crownIconContainer}><Text style={styles.crownIcon}>👑</Text></View>
        )}
        <View style={[styles.podiumAvatarWrapper, isFirst && styles.podiumAvatarFirstWrapper]}>
          <InitialsAvatar name={entry.name} size={isFirst ? 88 : 72} />
        </View>
        <View
          style={[
            styles.podiumRankBadge,
            isFirst ? styles.rankBadgeFirst : { backgroundColor: rank === 2 ? '#E0E0E0' : '#CD7F32' },
          ]}
        >
          <Text style={isFirst ? styles.podiumRankTextFirst : [styles.podiumRankText, rank === 3 && { color: '#fff' }]}>
            {rank}
          </Text>
        </View>
        <Text style={isFirst ? styles.podiumNameFirst : styles.podiumName} numberOfLines={1}>
          {isMe ? `${entry.name} (You)` : entry.name}
        </Text>
        <View style={isFirst ? styles.scoreBadgeFirst : styles.scoreBadge}>
          <Text style={isFirst ? styles.scoreBadgeIconFirst : styles.scoreBadgeIcon}>⚡</Text>
          <Text style={isFirst ? styles.scoreBadgeTextFirst : styles.scoreBadgeText}>{entry.score}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />

      <BrandHeader
        style={styles.topAppBar}
        rightContent={
          <TouchableOpacity style={styles.appBarIcon}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Top Eco Heroes</Text>
          <Text style={styles.pageSubtitle}>
            {myRank
              ? `You're ranked #${myRank} of ${rows.length}. Keep cleaning to climb!`
              : "See who's leading the charge for a greener tomorrow."}
          </Text>
        </View>

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.stateText}>Loading rankings…</Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateEmoji}>🌱</Text>
            <Text style={styles.stateText}>No eco heroes yet — be the first to act!</Text>
          </View>
        ) : (
          <>
            {hasPodium && (
              <View style={styles.podiumContainer}>
                {renderPodiumCard(podium[1], 2)}
                {renderPodiumCard(podium[0], 1)}
                {renderPodiumCard(podium[2], 3)}
              </View>
            )}

            <View style={styles.listContainer}>
              {listRows.map((user, idx) => {
                const rank = (hasPodium ? 4 : 1) + idx;
                const isMe = user.uid === uid;
                return (
                  <View key={user.uid} style={[styles.listItem, isMe && styles.listItemActive]}>
                    {isMe && <View style={styles.activeIndicator} />}
                    <Text style={[styles.listRank, isMe && styles.listRankActive]}>{rank}</Text>
                    <View style={[styles.listAvatarContainer, isMe && styles.listAvatarContainerActive]}>
                      <InitialsAvatar name={user.name} size={52} />
                    </View>
                    <View style={styles.listTextContent}>
                      <Text style={[styles.listName, isMe && styles.listNameActive]} numberOfLines={1}>
                        {isMe ? `${user.name} (You)` : user.name}
                      </Text>
                      {user.streak > 0 && <Text style={styles.listSubtext}>🔥 {user.streak}-day streak</Text>}
                    </View>
                    <View style={[styles.listScoreBadge, isMe && styles.listScoreBadgeActive]}>
                      <Text style={[styles.listScoreText, isMe && styles.listScoreTextActive]}>{user.score}</Text>
                      <Text style={[styles.listScoreIcon, isMe && styles.listScoreIconActive]}>⚡</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  topAppBar: {
    backgroundColor: 'transparent',
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
    fontSize: 34,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    opacity: 0.8,
  },
  stateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 14,
  },
  stateText: {
    fontSize: 15,
    color: '#166534',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  stateEmoji: { fontSize: 48 },
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#14532D',
    borderWidth: 0,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(20, 83, 45, 0.2)',
      },
      default: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
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
    fontWeight: '800',
    fontSize: 18,
    color: '#14532D',
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
    fontWeight: '800',
    color: '#14532D',
    marginTop: 40,
  },
  podiumNameFirst: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532D',
    marginTop: 56,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginTop: 8,
  },
  scoreBadgeFirst: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  scoreBadgeIcon: {
    fontSize: 14,
    color: '#14532D',
    marginRight: 4,
  },
  scoreBadgeIconFirst: {
    fontSize: 16,
    color: '#14532D',
    marginRight: 4,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#14532D',
  },
  scoreBadgeTextFirst: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532D',
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
  },
  listItemActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
    overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#14532D',
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
    color: '#14532D',
    opacity: 1,
    paddingLeft: 4,
  },
  listAvatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  listAvatarContainerActive: {
    borderColor: '#14532D',
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
    fontWeight: '800',
    color: '#14532D',
  },
  listNameActive: {
    color: '#14532D',
  },
  listSubtext: {
    fontSize: 13,
    color: '#166534',
    marginTop: 2,
    fontWeight: '500',
  },
  listScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  listScoreBadgeActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  listScoreText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532D',
    marginRight: 4,
  },
  listScoreTextActive: {
    color: '#14532D',
  },
  listScoreIcon: {
    fontSize: 16,
    color: '#14532D',
  },
  listScoreIconActive: {
    color: '#14532D',
  }
});
