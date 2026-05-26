import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert
} from 'react-native';
import { auth, db } from '../../firebase';
import { doc, setDoc, getDocs, query, where, collection } from 'firebase/firestore';
import BrandHeader from '../../components/BrandHeader';

export default function NicknameScreen({ navigation }: any) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  // Validate nickname: 3-20 chars, alphanumeric + underscores, no reserved words
  const RESERVED = ['admin', 'greenpulse', 'support', 'system', 'root', 'null', 'undefined', 'moderator'];
  const validateNickname = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.length < 3) return 'Nickname must be at least 3 characters.';
    if (trimmed.length > 20) return 'Nickname must be 20 characters or less.';
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'Only letters, numbers, and underscores allowed.';
    if (/^_|_$/.test(trimmed)) return 'Nickname cannot start or end with an underscore.';
    if (RESERVED.includes(trimmed.toLowerCase())) return 'That nickname is reserved. Please choose another.';
    return '';
  };

  // Case-insensitive uniqueness check via nickname_lower index
  const checkNicknameUnique = async (value: string): Promise<boolean> => {
    try {
      const q = query(
        collection(db, 'children'),
        where('nickname_lower', '==', value.toLowerCase())
      );
      const snap = await getDocs(q);
      return snap.empty;
    } catch (err) {
      console.warn('[NicknameScreen] Uniqueness check failed (allowing):', err);
      return true; // Fail-open so offline users aren't blocked
    }
  };

  const handleContinue = async () => {
    const trimmed = nickname.trim();
    // Validate before submitting
    const validationError = validateNickname(trimmed);
    if (validationError) {
      setNicknameError(validationError);
      return;
    }
    setNicknameError('');

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'Not signed in. Please restart the app.');
      return;
    }

    setLoading(true);

    // Check uniqueness before writing
    const unique = await checkNicknameUnique(trimmed);
    if (!unique) {
      setNicknameError('That nickname is already taken. Please choose another.');
      setLoading(false);
      return;
    }

    // Race the Firestore write against an 8-second timeout.
    // If Firestore is unreachable (emulator off, no network), we still
    // let the user proceed — the nickname write is not critical enough
    // to block the entire onboarding flow.
    const writePromise = setDoc(
      doc(db, 'children', uid),
      {
        nickname: trimmed,
        nickname_lower: trimmed.toLowerCase(), // indexed for uniqueness checks
      },
      { merge: true }
    );
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), 8000)
    );

    try {
      await Promise.race([writePromise, timeoutPromise]);
    } catch (error: any) {
      // Log but don't block navigation — offline/emulator not running
      console.warn('[NicknameScreen] Could not save nickname to Firestore:', error?.message);
    } finally {
      setLoading(false);
    }

    // Always navigate forward
    navigation?.navigate('VpcGate');
  };

  const charCount = nickname.trim().length;

  return (
    <SafeAreaView style={styles.container}>
      <BrandHeader />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            
            <View style={styles.card}>
              {/* Subtle Decorative Element */}
              <View style={styles.decorativeBlob} />

              {/* Header Section */}
              <View style={styles.headerContainer}>
                <Text style={styles.titleText}>Choose your garden name</Text>
              </View>

              {/* Form / Input Section */}
              <View style={styles.inputSection}>
                <View style={[styles.inputContainer, nicknameError ? styles.inputContainerError : null]}>
                  <Text style={styles.inputIcon}>@</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. eco_hero42"
                    placeholderTextColor="#68756B"
                    value={nickname}
                    onChangeText={(t) => { setNickname(t); setNicknameError(''); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                  />
                  <Text style={[styles.charCount, charCount > 20 && { color: '#ba1a1a' }]}>
                    {charCount}/20
                  </Text>
                </View>
                {nicknameError ? (
                  <Text style={styles.errorText}>⚠️ {nicknameError}</Text>
                ) : (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <Text style={styles.infoText}>3–20 characters, letters, numbers, and _ only.</Text>
                  </View>
                )}
              </View>

              {/* Privacy Note */}
              <View style={styles.privacyNote}>
                <Text style={styles.shieldIcon}>🛡️</Text>
                <Text style={styles.privacyText}>Your real name is never shown.</Text>
              </View>

              {/* Action Section */}
              <View style={styles.actionSection}>
                <TouchableOpacity 
                  style={[styles.button, loading && { opacity: 0.7 }]} 
                  onPress={handleContinue}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Continue</Text>
                      <Text style={styles.arrowIcon}>→</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    // Shadow for iOS
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 16px rgba(47, 143, 42, 0.1)',
      },
      default: {
        shadowColor: '#2F8F2A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  decorativeBlob: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 160,
    height: 160,
    backgroundColor: '#e3ebdc',
    borderRadius: 80,
    opacity: 0.5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 10,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#006e09',
    marginTop: 4,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#becab6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerError: {
    borderColor: '#ba1a1a',
  },
  charCount: {
    fontSize: 12,
    color: '#68756B',
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ba1a1a',
    marginTop: 6,
  },
  inputIcon: {
    fontSize: 18,
    color: '#68756B',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2A1F',
    height: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#68756B',
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6e7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    zIndex: 10,
  },
  shieldIcon: {
    fontSize: 20,
    color: '#38ad32',
    marginRight: 12,
  },
  privacyText: {
    fontSize: 14,
    color: '#68756B',
    flex: 1,
  },
  actionSection: {
    zIndex: 10,
  },
  button: {
    backgroundColor: '#006e09',
    flexDirection: 'row',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
