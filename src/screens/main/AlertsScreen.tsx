import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import BrandHeader from '../../components/BrandHeader';

interface AlertItem {
  id: string;
  type: 'reward' | 'rejection' | 'streak' | 'system';
  title: string;
  body: string;
  timestamp: number; // ms
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_META: Record<AlertItem['type'], { icon: string; color: string; bg: string }> = {
  reward:    { icon: '🎉', color: '#006e09', bg: '#e9f0e1' },
  rejection: { icon: '❌', color: '#ba1a1a', bg: '#ffdad6' },
  streak:    { icon: '🔥', color: '#E35D5D', bg: '#fff4e5' },
  system:    { icon: 'ℹ️', color: '#68756B', bg: '#F0F4EE' },
};

export default function AlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const uid = auth.currentUser?.uid ?? '';

  const fetchAlerts = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      const items: AlertItem[] = [];

      // ── Fetch recent reward log entries ───────────────────────────────
      const rewardQ = query(
        collection(db, 'reward_log'),
        where('child_uid', '==', uid),
        limit(20)
      );
      const rewardSnap = await getDocs(rewardQ);
      rewardSnap.forEach((d) => {
        const data = d.data();
        const ts: number = data.created_at instanceof Timestamp
          ? data.created_at.toMillis()
          : Date.now();
        const actionLabel = (data.action_type as string)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const bonus = data.multiplier_applied ? ' (1.5× streak bonus!)' : '';
        items.push({
          id: `reward-${d.id}`,
          type: 'reward',
          title: `+${data.points_awarded} XP Earned!`,
          body: `Your ${actionLabel} action was verified${bonus}`,
          timestamp: ts,
        });
      });

      // ── Fetch recent rejected actions ──────────────────────────────────
      const rejQ = query(
        collection(db, 'actions'),
        where('child_uid', '==', uid),
        where('status', '==', 'rejected'),
        limit(10)
      );
      const rejSnap = await getDocs(rejQ);
      rejSnap.forEach((d) => {
        const data = d.data();
        const ts: number = data.processed_at instanceof Timestamp
          ? data.processed_at.toMillis()
          : data.created_at instanceof Timestamp
          ? data.created_at.toMillis()
          : Date.now();
        const actionLabel = (data.action_type as string)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        items.push({
          id: `reject-${d.id}`,
          type: 'rejection',
          title: 'Action Not Verified',
          body: `Your ${actionLabel} photo could not be confirmed. Try again with better lighting!`,
          timestamp: ts,
        });
      });

      // ── Sort by time descending ────────────────────────────────────────
      items.sort((a, b) => b.timestamp - a.timestamp);

      // ── Add static system notice if no real notifications yet ──────────
      if (items.length === 0) {
        items.push({
          id: 'sys-welcome',
          type: 'system',
          title: 'Welcome to GreenPulse! 🌿',
          body: 'Complete your first eco-action to start earning XP and growing your garden.',
          timestamp: Date.now(),
        });
      }

      setAlerts(items);
    } catch (err) {
      console.warn('[AlertsScreen] fetchAlerts error:', err);
      setAlerts([{
        id: 'sys-error',
        type: 'system',
        title: 'Could Not Load Notifications',
        body: 'Check your connection and pull to refresh.',
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const renderItem = ({ item }: { item: AlertItem }) => {
    const meta = TYPE_META[item.type];
    return (
      <View style={styles.alertCard}>
        <View style={[styles.alertIconWrap, { backgroundColor: meta.bg }]}>
          <Text style={styles.alertIcon}>{meta.icon}</Text>
        </View>
        <View style={styles.alertBody}>
          <Text style={[styles.alertTitle, { color: meta.color }]}>{item.title}</Text>
          <Text style={styles.alertDesc}>{item.body}</Text>
          <Text style={styles.alertTime}>{timeAgo(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />

      {/* Header */}
      <BrandHeader 
        showBackButton={true}
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#006e09" />
          <Text style={styles.loadingText}>Loading notifications…</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#006e09"
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyDesc}>Complete eco-actions to receive updates here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F2' },
  listContent: { padding: 16, paddingBottom: 40 },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  alertIcon: { fontSize: 22 },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  alertDesc: { fontSize: 13, color: '#68756B', lineHeight: 18 },
  alertTime: { fontSize: 11, color: '#9EAD9A', marginTop: 5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#68756B' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2A1F', marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#68756B', textAlign: 'center', paddingHorizontal: 32 },
});
