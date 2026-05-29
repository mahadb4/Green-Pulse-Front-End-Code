import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import BrandHeader from '../../components/BrandHeader';

export default function ParentEntryScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      <BrandHeader transparent={true} />
      <View style={styles.content}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={styles.title}>Parent Portal</Text>
        <Text style={styles.subtitle}>
          Monitor your child's eco-actions, manage consent, and review their progress.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('ParentDashboard')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Enter Parent Dashboard →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  icon: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '900', color: '#14532D', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#166534', textAlign: 'center', lineHeight: 22, opacity: 0.85 },
  btn: {
    width: '100%', paddingVertical: 16, borderRadius: 999, backgroundColor: '#14532D', alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.25)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
    }),
  },
  btnText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  backBtn: { paddingVertical: 12 },
  backText: { fontSize: 15, fontWeight: '700', color: '#166534' },
});
