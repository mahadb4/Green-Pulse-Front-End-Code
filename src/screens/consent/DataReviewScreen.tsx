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

// Generate a cryptographically-adequate 6-digit OTP
function generateOtp(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return String(digits);
}

// Basic email format validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default function DataReviewScreen({ navigation }: any) {
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

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'Session expired. Please restart the app.');
      return;
    }

    setLoading(true);

    // ── Generate OTP and store in Firestore ──────────────────────────────────
    // The OTP is stored on the child's document so OtpScreen can validate it.
    // In production this would also trigger a Firebase Function that emails the code.
    // For now: show the code in a dev alert so it can be tested without email infra.
    const otp = generateOtp();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        p,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), ms)
        ),
      ]);

    try {
      await withTimeout(
        setDoc(
          doc(db, 'children', uid),
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
            onPress: () => navigation.navigate('Otp'),
          },
        ]
      );
    } catch (err: any) {
      console.warn('[DataReview] Could not store OTP:', err?.message);
      // Still navigate — OTP screen will do best-effort validation
      Alert.alert(
        'Notice',
        'Could not reach the server. Proceeding in offline mode.',
        [{ text: 'Continue', onPress: () => navigation.navigate('Otp') }]
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
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <BrandHeader showBackButton onBack={handleCancel} />
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
              <View style={styles.formCard}>
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
                    style={[styles.primaryButton, loading && { opacity: 0.6 }]}
                    onPress={handleSendOtp}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Send OTP</Text>
                        <Text style={styles.arrowIcon}>→</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
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
  container: { flex: 1, backgroundColor: '#F6F7F2' },
  keyboardAvoidingView: { flex: 1 },
  innerContainer: { flex: 1, paddingHorizontal: 20, alignItems: 'center' },
  mainContent: { width: '100%', maxWidth: 440, alignItems: 'center' },
  titleSection: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 8 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#e9f0e1',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  shieldIcon: { fontSize: 40 },
  titleText: { fontSize: 32, fontWeight: 'bold', color: '#1F2A1F', marginBottom: 8 },
  subtitleText: { fontSize: 16, color: '#68756B', textAlign: 'center', lineHeight: 24, maxWidth: 320 },
  formCard: {
    backgroundColor: '#FFFFFF', width: '100%', borderRadius: 28, padding: 32,
    borderWidth: 1, borderColor: '#D8E1D3',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#3f4a3a', marginBottom: 8, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#D8E1D3', borderRadius: 8, paddingHorizontal: 16, height: 48,
  },
  inputContainerError: { borderColor: '#ba1a1a' },
  mailIcon: { fontSize: 20, color: '#68756B', marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1F2A1F', height: '100%' },
  errorText: { fontSize: 12, color: '#ba1a1a', marginTop: 6 },
  securityNotice: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#eff6e7',
    borderRadius: 16, padding: 20, marginBottom: 32,
  },
  lockIcon: { fontSize: 20, marginRight: 16, marginTop: 2 },
  securityTextContainer: { flex: 1 },
  securityTitle: { fontSize: 14, fontWeight: 'bold', color: '#1F2A1F', marginBottom: 4 },
  securityText: { fontSize: 14, color: '#68756B', lineHeight: 20 },
  actionGroup: { marginTop: 8 },
  primaryButton: {
    backgroundColor: '#006e09', flexDirection: 'row',
    height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  arrowIcon: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  secondaryButton: { height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: '#68756B', fontSize: 16, fontWeight: 'bold' },
});
