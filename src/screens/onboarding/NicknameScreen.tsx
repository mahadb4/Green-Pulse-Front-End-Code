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
  ActivityIndicator
} from 'react-native';
import { auth, db } from '../../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import AnimatedBackground from '../../components/AnimatedBackground';

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


  const handleContinue = async () => {
    const trimmed = nickname.trim();
    // Validate before submitting
    const validationError = validateNickname(trimmed);
    if (validationError) {
      setNicknameError(validationError);
      return;
    }
    setNicknameError('');
    setLoading(true);

    const usernameLower = trimmed.toLowerCase();

    try {
      // ── Step 1: Ensure the user is authenticated (sign in anonymously if not) ──
      let uid = auth.currentUser?.uid;
      if (!uid) {
        try {
          const { signInAnonymously } = await import('firebase/auth');
          const cred = await signInAnonymously(auth);
          uid = cred.user.uid;
          console.log('[NicknameScreen] Signed in anonymously, uid:', uid);
        } catch (authErr: any) {
          console.warn('[NicknameScreen] Anonymous auth failed:', authErr?.message);
          // If anonymous auth is disabled, just navigate forward without Firestore ops
          setLoading(false);
          navigation?.navigate('VpcGate', { nickname: trimmed });
          return;
        }
      }

      // ── Step 2: Reserve nickname atomically in Firestore ──────────────────────
      try {
        await runTransaction(db, async (transaction) => {
          const usernameRef = doc(db, 'usernames', usernameLower);
          const usernameSnap = await transaction.get(usernameRef);
          if (usernameSnap.exists() && usernameSnap.data()?.uid !== uid) {
            throw new Error('taken');
          }
          // Reserve the username
          transaction.set(usernameRef, {
            uid,
            username: trimmed,
            createdAt: new Date().toISOString(),
          });
          // Save user profile
          const userRef = doc(db, 'users', uid!);
          transaction.set(userRef, {
            uid,
            username: trimmed,
            usernameLower,
            createdAt: new Date().toISOString(),
          }, { merge: true });
          // Children collection profile
          const childRef = doc(db, 'children', uid!);
          transaction.set(childRef, {
            nickname: trimmed,
            nickname_lower: usernameLower,
            energy_points: 0,
            current_streak: 0,
            parent_approved: false,
            garden_id: `garden_${uid}`,
            last_action_at: null,
            fcm_token: null,
            notifications_disabled: false,
          }, { merge: true });
        });
      } catch (err: any) {
        if (err.message === 'taken') {
          setNicknameError('Username already taken. Please choose another one.');
          setLoading(false);
          return;
        }
        // Non-fatal Firestore errors — still proceed
        console.warn('[NicknameScreen] Firestore transaction error (proceeding anyway):', err?.message);
      }
    } catch (outerErr: any) {
      console.warn('[NicknameScreen] Unexpected error:', outerErr?.message);
    }

    setLoading(false);
    navigation?.navigate('VpcGate', { nickname: trimmed });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const charCount = nickname.trim().length;

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
          <View style={styles.innerContainer}>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            
            {/* Form Card */}
            <View style={styles.glassCard}>
              {/* Header Section */}
              <View style={styles.headerContainer}>
                <Text style={styles.headerIcon}>🌿</Text>
                <Text style={styles.titleText}>Choose your garden name</Text>
                <Text style={styles.subtitleText}>This will be your unique handle</Text>
              </View>

              {/* Form / Input Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Eco-Nickname</Text>
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
              <TouchableOpacity 
                style={[styles.button, loading && { opacity: 0.8 }]} 
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    zIndex: 20,
  },
  backIcon: {
    fontSize: 22,
    color: '#006e09',
    fontWeight: 'bold',
    lineHeight: Platform.OS === 'android' ? 26 : undefined,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)',
        boxShadow: '0 20px 40px rgba(22,163,74,0.15)',
      },
      default: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#14532D',
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 15,
    color: '#166534',
    opacity: 0.8,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14532D',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerError: {
    borderColor: '#ba1a1a',
  },
  charCount: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    marginLeft: 8,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 12,
    color: '#ba1a1a',
    marginTop: 6,
    marginLeft: 4,
  },
  inputIcon: {
    fontSize: 18,
    color: '#166534',
    marginRight: 12,
    opacity: 0.8,
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
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#166534',
    opacity: 0.8,
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,222,128,0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  shieldIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  privacyText: {
    fontSize: 14,
    color: '#166534',
    flex: 1,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#14532D',
    flexDirection: 'row',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 25px rgba(20, 83, 45, 0.3)',
      },
      default: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  arrowIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
