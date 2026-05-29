import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  Image, ScrollView, Alert, Platform, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import BrandHeader from '../../components/BrandHeader';

export default function CameraBeforeAfterScreen({ navigation, route }: any) {
  const { actionType = 'pick_litter', points = 15 } = route.params || {};
  const [beforeUri, setBeforeUri] = useState<string | null>(null);
  const [afterUri, setAfterUri] = useState<string | null>(null);
  const [isPickingBefore, setIsPickingBefore] = useState(false);
  const [isPickingAfter, setIsPickingAfter] = useState(false);

  const pickImage = async (
    setter: (uri: string) => void,
    setLoading: (v: boolean) => void
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setter(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!beforeUri || !afterUri) {
      Alert.alert('Both Photos Required', 'Please upload both a before and after photo for litter pickup verification.');
      return;
    }
    // Navigate to PhotoPreview using the "after" photo (the cleaner scene)
    navigation.navigate('PhotoPreview', { photoUri: afterUri, actionType, points });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      <BrandHeader transparent={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Before & After</Text>
        <Text style={styles.subtitle}>For litter pickup, upload both a before and after photo so Zara can verify your action.</Text>

        {/* Before */}
        <TouchableOpacity
          style={styles.photoBox}
          onPress={() => pickImage(setBeforeUri, setIsPickingBefore)}
          activeOpacity={0.8}
        >
          {isPickingBefore ? (
            <ActivityIndicator size="large" color="#4ADE80" />
          ) : beforeUri ? (
            <Image source={{ uri: beforeUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderLabel}>BEFORE</Text>
              <Text style={styles.placeholderHint}>Tap to upload before photo</Text>
            </View>
          )}
          {beforeUri && <View style={styles.overlay}><Text style={styles.overlayLabel}>BEFORE</Text></View>}
        </TouchableOpacity>

        {/* After */}
        <TouchableOpacity
          style={styles.photoBox}
          onPress={() => pickImage(setAfterUri, setIsPickingAfter)}
          activeOpacity={0.8}
        >
          {isPickingAfter ? (
            <ActivityIndicator size="large" color="#4ADE80" />
          ) : afterUri ? (
            <Image source={{ uri: afterUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>🤖</Text>
              <Text style={styles.placeholderLabel}>AFTER (AI SCANNED)</Text>
              <Text style={styles.placeholderHint}>Tap to upload after photo</Text>
            </View>
          )}
          {afterUri && <View style={styles.overlay}><Text style={styles.overlayLabel}>AFTER</Text></View>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueBtn, (!beforeUri || !afterUri) && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!beforeUri || !afterUri}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '900', color: '#14532D', letterSpacing: -0.5, marginBottom: 6, marginTop: 8 },
  subtitle: { fontSize: 14, color: '#166534', lineHeight: 20, marginBottom: 20, opacity: 0.85 },
  photoBox: {
    width: '100%', height: 200, borderRadius: 24, overflow: 'hidden',
    backgroundColor: '#FFFFFF', marginBottom: 16,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.05)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    }),
  },
  photo: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  placeholderIcon: { fontSize: 40, opacity: 0.8 },
  placeholderLabel: { fontSize: 14, fontWeight: '900', color: '#14532D', letterSpacing: 1 },
  placeholderHint: { fontSize: 12, color: '#166534', opacity: 0.7 },
  overlay: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(20,83,45,0.85)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  overlayLabel: { fontSize: 12, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  continueBtn: { 
    height: 60, justifyContent: 'center', borderRadius: 30, backgroundColor: '#14532D', 
    alignItems: 'center', marginTop: 12,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(20,83,45,0.2)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
    }),
  },
  continueBtnDisabled: { backgroundColor: '#9CA3AF' },
  continueBtnText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
});
