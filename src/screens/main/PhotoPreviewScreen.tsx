import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { uploadActionPhoto, submitAction, ActionType, ACTION_CONFIGS } from '../../services/actionService';
import { auth } from '../../firebase';

const ACTION_TYPES: ActionType[] = [
  'recycle_bottle', 'plant_seed', 'water_plant',
  'pick_litter', 'compost_waste', 'turn_off_light',
];

export default function PhotoPreviewScreen({ route, navigation }: any) {
  const { photoPath, photoUri, points } = route.params || {};
  const [uploading, setUploading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType>('recycle_bottle');
  // Hard mutex: prevents duplicate submits if user taps twice or component re-renders
  const isSubmitting = useRef(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop';

  const getImageSource = () => {
    if (photoUri) return { uri: photoUri };
    if (photoPath) {
      if (photoPath.startsWith('http')) return { uri: photoPath };
      return { uri: `file://${photoPath}` };
    }
    return { uri: fallbackImage };
  };

  const imageSource = getImageSource();

  const handleClose = () => navigation.goBack();
  const handleRetake = () => navigation.goBack();

  const handleConfirm = async () => {
    // Hard guard: block any concurrent or duplicate submissions
    if (isSubmitting.current || uploading) {
      console.warn('[PhotoPreview] Submission already in progress, ignoring duplicate tap.');
      return;
    }
    if (!auth.currentUser) {
      Alert.alert('Error', 'Not signed in. Please restart the app.');
      return;
    }

    isSubmitting.current = true;
    try {
      setUploading(true);

      const imageUri = photoUri || photoPath || fallbackImage;

      // Step 1: Upload photo to Firebase Storage
      let downloadUrl: string;
      try {
        downloadUrl = await uploadActionPhoto(imageUri);
      } catch (uploadErr: any) {
        console.warn('[PhotoPreview] Upload failed, using placeholder URL:', uploadErr?.message);
        // For development/testing: use a placeholder if Storage upload fails
        downloadUrl = fallbackImage;
      }

      // Step 2: Submit action (calls Cloud Function or local simulation)
      const result = await submitAction(selectedAction, downloadUrl);

      // Step 3: Navigate to Processing screen with action_id to listen for AI result
      navigation.navigate('Processing', {
        actionId: result.action_id,
        actionType: selectedAction,
        points: ACTION_CONFIGS[selectedAction].points,
      });
    } catch (error: any) {
      console.error('[PhotoPreview] handleConfirm error:', error);
      Alert.alert(
        'Submission Failed',
        error?.message ?? 'Could not submit your action. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* The Captured Image (Background) */}
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.backgroundImage} resizeMode="cover" />
        <View style={styles.scrim} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} disabled={uploading}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Action Card */}
        <View style={styles.bottomCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.contentContainer}>
              <View style={styles.textSection}>
                <Text style={styles.title}>Looking Good? 📸</Text>
                <Text style={styles.subtitle}>Select your eco-action type, then confirm.</Text>
              </View>

              {/* Action Type Selector */}
              <View style={styles.actionSelector}>
                <Text style={styles.actionSelectorLabel}>ACTION TYPE</Text>
                <View style={styles.actionGrid}>
                  {ACTION_TYPES.map((type) => {
                    const config = ACTION_CONFIGS[type];
                    const isSelected = selectedAction === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[styles.actionChip, isSelected && styles.actionChipSelected]}
                        onPress={() => setSelectedAction(type)}
                        disabled={uploading}
                      >
                        <Text style={styles.actionChipIcon}>{config.icon}</Text>
                        <Text style={[styles.actionChipText, isSelected && styles.actionChipTextSelected]}>
                          {config.label}
                        </Text>
                        {isSelected && (
                          <Text style={styles.actionChipPoints}>+{config.points}pts</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                {/* Primary CTA */}
                <TouchableOpacity
                  style={[styles.primaryButton, uploading && { opacity: 0.6 }]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                      <Text style={styles.primaryButtonText}>Uploading...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Submit Action ✓</Text>
                      <Text style={styles.buttonIconPrimary}>+{ACTION_CONFIGS[selectedAction].points}pts</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Retake */}
                <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake} disabled={uploading}>
                  <Text style={styles.buttonIconSecondary}>↺</Text>
                  <Text style={styles.secondaryButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171d14' },
  imageContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
  },
  backgroundImage: { width: '100%', height: '100%' },
  scrim: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    backgroundColor: 'rgba(23, 29, 20, 0.5)',
  },
  safeArea: { flex: 1, zIndex: 10, justifyContent: 'space-between' },
  header: { paddingHorizontal: 20, paddingTop: 24, alignItems: 'flex-start' },
  closeButton: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(238, 242, 234, 0.8)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { fontSize: 20, color: '#1F2A1F' },
  bottomCard: {
    backgroundColor: '#F6F7F2',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    maxHeight: '70%',
    ...Platform.select({
      web: { boxShadow: '0px -8px 30px rgba(0, 0, 0, 0.12)' },
      default: {
        shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12, shadowRadius: 30, elevation: 20,
      },
    }),
  },
  contentContainer: {
    maxWidth: 440, width: '100%', alignSelf: 'center',
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32,
  },
  textSection: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1F2A1F', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#68756B', textAlign: 'center' },
  actionSelector: { marginBottom: 20 },
  actionSelectorLabel: {
    fontSize: 11, fontWeight: 'bold', color: '#68756B',
    letterSpacing: 1, marginBottom: 10,
  },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#D8E1D3',
    backgroundColor: '#FFFFFF', gap: 6,
  },
  actionChipSelected: {
    borderColor: '#006e09', backgroundColor: '#e9f0e1',
  },
  actionChipIcon: { fontSize: 16 },
  actionChipText: { fontSize: 13, color: '#68756B', fontWeight: '600' },
  actionChipTextSelected: { color: '#006e09' },
  actionChipPoints: {
    fontSize: 11, color: '#006e09', fontWeight: 'bold',
    backgroundColor: 'rgba(0,110,9,0.1)', paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 8,
  },
  buttonContainer: { width: '100%', gap: 12 },
  primaryButton: {
    width: '100%', paddingVertical: 16, paddingHorizontal: 24,
    backgroundColor: '#006e09', borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0, 110, 9, 0.3)' },
      default: {
        shadowColor: '#006e09', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
      },
    }),
  },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: 'bold', marginRight: 8 },
  buttonIconPrimary: {
    color: '#94f68b', fontSize: 14, fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10,
  },
  secondaryButton: {
    width: '100%', paddingVertical: 14, paddingHorizontal: 24,
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#D8E1D3',
    borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  buttonIconSecondary: { color: '#1F2A1F', fontSize: 24, marginRight: 8 },
  secondaryButtonText: { color: '#1F2A1F', fontSize: 17, fontWeight: 'bold' },
});
