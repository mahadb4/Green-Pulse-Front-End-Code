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

      // If submission succeeded and we have a real action ID, proceed to processing
      if (result.success && result.action_id) {
        navigation.navigate('Processing', {
          actionId: result.action_id,
          actionType: selectedAction,
          points: ACTION_CONFIGS[selectedAction].points,
        });
      } else {
        // Show an error and stay on this screen
        console.warn('[PhotoPreview] submitAction failed or no action ID:', result.message);
        Alert.alert('Submission Error', result.message || 'Could not submit action.');
      }
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
    backgroundColor: 'rgba(240, 255, 244, 0.95)',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    maxHeight: '70%',
    ...Platform.select({
      web: { backdropFilter: 'blur(20px)', boxShadow: '0px -8px 30px rgba(0, 0, 0, 0.12)' },
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
  title: { fontSize: 28, fontWeight: '900', color: '#14532D', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#166534', textAlign: 'center', fontWeight: '500' },
  actionSelector: { marginBottom: 20 },
  actionSelectorLabel: {
    fontSize: 12, fontWeight: '800', color: '#166534',
    letterSpacing: 1, marginBottom: 10,
  },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,1)',
    backgroundColor: 'rgba(255,255,255,0.85)', gap: 6,
  },
  actionChipSelected: {
    borderColor: '#14532D', backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  actionChipIcon: { fontSize: 16 },
  actionChipText: { fontSize: 13, color: '#166534', fontWeight: '600' },
  actionChipTextSelected: { color: '#14532D', fontWeight: '800' },
  actionChipPoints: {
    fontSize: 11, color: '#14532D', fontWeight: '900',
    backgroundColor: 'rgba(74, 222, 128, 0.4)', paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 8,
  },
  buttonContainer: { width: '100%', gap: 12 },
  primaryButton: {
    width: '100%', paddingVertical: 16, paddingHorizontal: 24,
    backgroundColor: '#14532D', borderRadius: 999, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(20,83,45,0.3)' },
      default: {
        shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
      },
    }),
  },
  primaryButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginRight: 8, letterSpacing: 0.5 },
  buttonIconPrimary: {
    color: '#ffffff', fontSize: 14, fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10,
  },
  secondaryButton: {
    width: '100%', paddingVertical: 14, paddingHorizontal: 24, height: 56,
    backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,1)',
    borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  buttonIconSecondary: { color: '#14532D', fontSize: 24, marginRight: 8 },
  secondaryButtonText: { color: '#14532D', fontSize: 17, fontWeight: '800' },
});
