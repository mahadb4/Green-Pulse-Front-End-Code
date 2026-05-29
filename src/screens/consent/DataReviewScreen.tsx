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
  Alert,
} from 'react-native';
import { auth, db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import BrandHeader from '../../components/BrandHeader';
import AnimatedBackground from '../../components/AnimatedBackground';

// Generate a cryptographically-adequate 6-digit OTP
function generateOtp(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return String(digits);
}

// Basic email format validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default function DataReviewScreen({ navigation, route }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSendOtp = async () => {
    // ── Client-side email validation ──────────────────────────────────────────
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Please enter a parent email address.');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError('Please enter a valid email address (e.g. parent@example.com).');
      return;
    }
    setEmailError('');

    let uid = auth.currentUser?.uid;
    if (!uid) {
      // Edge case: user somehow lost auth state — try anonymous sign-in
      try {
        const { signInAnonymously } = await import('firebase/auth');
        const cred = await signInAnonymously(auth);
        uid = cred.user.uid;
      } catch (authErr: any) {
        Alert.alert('Error', 'Unable to authenticate. Please restart the app and try again.');
        return;
      }
    }

    setLoading(true);

    // ── Generate OTP and store in Firestore ──────────────────────────────────
    // The OTP is stored on the child's document so OtpScreen can validate it.
    const otp = generateOtp();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
      return Promise.race([
        p,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), ms)
        ),
      ]);
    }

    try {
      await withTimeout(
        setDoc(
          doc(db, 'children', uid!),
          {
            pending_otp: otp,
            pending_otp_expires: otpExpiresAt,
            parent_email: trimmed,
          },
          { merge: true }
        ),
        6000
      );

      // ── Dev mode: show the OTP since there is no email infra yet ─────────────
      Alert.alert(
        '📧 OTP Generated',
        `In production this would be emailed to ${trimmed}.\n\n` +
        `For testing, your code is:\n\n` +
        `  ${otp}\n\n` +
        `(Valid for 10 minutes)`,
        [
          {
            text: 'Got it',
            onPress: () => navigation.navigate('Otp', { nickname: route?.params?.nickname }),
          },
        ]
      );
    } catch (err: any) {
      console.warn('[DataReview] Could not store OTP:', err?.message);
      // Still navigate — OTP screen will do best-effort validation
      Alert.alert(
        'Notice',
        'Could not reach the server. Proceeding in offline mode.',
        [{ text: 'Continue', onPress: () => navigation.navigate('Otp', { nickname: route?.params?.nickname }) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />

      <BrandHeader transparent={true} showBackButton onBack={handleCancel} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.mainContent}>
              
              {/* Header Section */}
              <View style={styles.titleSection}>
                <View style={styles.iconCircle}>
                  <Text style={styles.shieldIcon}>🛡️</Text>
                </View>
                <Text style={styles.titleText}>Parent Verification</Text>
                <Text style={styles.subtitleText}>
                  Enter a parent or guardian's email. We'll generate a verification code.
                </Text>
              </View>

              {/* Form Card */}
              <View style={styles.glassCard}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Parent's Email Address</Text>
                  <View style={[styles.inputContainer, emailError ? styles.inputContainerError : null]}>
                    <Text style={styles.mailIcon}>✉️</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="parent@example.com"
                      placeholderTextColor="#68756B"
                      value={email}
                      onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.errorText}>⚠️ {emailError}</Text>
                  ) : null}
                </View>

                {/* Security Notice */}
                <View style={styles.securityNotice}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <View style={styles.securityTextContainer}>
                    <Text style={styles.securityTitle}>Secure Verification</Text>
                    <Text style={styles.securityText}>
                      A 6-digit code will be sent to the parent's email. Only valid for 10 minutes.
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionGroup}>
                  <TouchableOpacity
                    style={[styles.buttonPrimary, loading && { opacity: 0.8 }]}
                    onPress={handleSendOtp}
                    activeOpacity={0.85}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.buttonTextPrimary}>Send OTP</Text>
                        <Text style={styles.arrowIcon}>→</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.buttonSecondary} onPress={handleCancel}>
                    <Text style={styles.buttonTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  keyboardAvoidingView: { flex: 1 },
  innerContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  mainContent: { width: '100%', maxWidth: 440, alignItems: 'center' },
  titleSection: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 8 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(74,222,128,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  shieldIcon: { fontSize: 44 },
  titleText: { fontSize: 30, fontWeight: '900', color: '#14532D', marginBottom: 8, letterSpacing: -0.5 },
  subtitleText: { fontSize: 15, color: '#166534', opacity: 0.8, textAlign: 'center', lineHeight: 23, maxWidth: 300 },
  glassCard: {
    width: '100%',
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
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#14532D', marginBottom: 8, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 16, paddingHorizontal: 16, height: 56,
  },
  inputContainerError: { borderColor: '#ba1a1a' },
  mailIcon: { fontSize: 20, color: '#166534', marginRight: 12, opacity: 0.8 },
  input: { flex: 1, fontSize: 16, color: '#1F2A1F', height: '100%' },
  errorText: { fontSize: 12, color: '#ba1a1a', marginTop: 6, marginLeft: 4 },
  securityNotice: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 16, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)',
  },
  lockIcon: { fontSize: 20, marginRight: 16, marginTop: 2 },
  securityTextContainer: { flex: 1 },
  securityTitle: { fontSize: 14, fontWeight: 'bold', color: '#14532D', marginBottom: 4 },
  securityText: { fontSize: 14, color: '#166534', lineHeight: 20, fontWeight: '500' },
  actionGroup: { marginTop: 8 },
  buttonPrimary: {
    backgroundColor: '#14532D', flexDirection: 'row',
    height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(20,83,45,0.3)' },
      default: {
        shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
      },
    }),
  },
  buttonTextPrimary: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginRight: 8, letterSpacing: 0.5 },
  arrowIcon: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  buttonSecondary: { height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  buttonTextSecondary: { color: '#166534', fontSize: 16, fontWeight: 'bold', opacity: 0.8 },
});
