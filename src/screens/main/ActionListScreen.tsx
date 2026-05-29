import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Platform } from 'react-native';
import { ACTION_CONFIGS, ActionType } from '../../services/actionService';
import BrandHeader from '../../components/BrandHeader';

const ACTION_TYPES = Object.keys(ACTION_CONFIGS) as ActionType[];

export default function ActionListScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      <BrandHeader transparent={true} />
      <View style={styles.content}>
        <Text style={styles.title}>Choose an Eco-Action</Text>
        <Text style={styles.subtitle}>Photograph your action to earn energy points</Text>
        <FlatList
          data={ACTION_TYPES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const config = ACTION_CONFIGS[item];
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.82}
                onPress={() => navigation.navigate('Camera', { actionType: item, points: config.points })}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.icon}>{config.icon}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.label}>{config.label}</Text>
                  <Text style={styles.desc}>{config.description}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgePts}>+{config.points}</Text>
                  <Text style={styles.badgeUnit}>pts</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#14532D', letterSpacing: -0.5, marginBottom: 4, marginTop: 8 },
  subtitle: { fontSize: 14, color: '#166534', fontWeight: '500', marginBottom: 20, opacity: 0.8 },
  list: { paddingBottom: 40 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 24,
    padding: 16, marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
  },
  iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.4)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  icon: { fontSize: 24 },
  info: { flex: 1 },
  label: { fontSize: 16, fontWeight: '800', color: '#14532D' },
  desc: { fontSize: 12, color: '#166534', marginTop: 2, opacity: 0.8 },
  badge: { alignItems: 'center', backgroundColor: 'rgba(74, 222, 128, 0.2)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(74,222,128,0.5)' },
  badgePts: { fontSize: 18, fontWeight: '900', color: '#14532D' },
  badgeUnit: { fontSize: 10, color: '#166534', fontWeight: '700' },
});
