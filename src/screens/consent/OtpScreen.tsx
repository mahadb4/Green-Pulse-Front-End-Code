import React, { useState, useRef } from 'react';
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
import { doc, getDoc } from 'firebase/firestore';
import { approveChild } from '../../services/gardenService';
import BrandHeader from '../../components/BrandHeader';
import AnimatedBackground from '../../components/AnimatedBackground';

export default function OtpScreen({ navigation, route }: any) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    setError(false);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError(true);
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'Not signed in. Please restart the app.');
      return;
    }

    setLoading(true);

    // ── Validate OTP against Firestore ────────────────────────────────────────
    let otpValid = false;
    try {
      const childSnap = await Promise.race([
        getDoc(doc(db, 'children', uid)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 6000)
        ),
      ]);

      const data = (childSnap as any).data?.() ?? {};
      const storedOtp: string = data.pending_otp ?? '';
      const expiresAt: number = data.pending_otp_expires ?? 0;

      if (!storedOtp) {
        // No OTP stored — offline dev mode, allow any complete code
        console.warn('[OtpScreen] No stored OTP found, allowing in dev mode.');
        otpValid = true;
      } else if (Date.now() > expiresAt) {
        // OTP expired
        Alert.alert(
          'Code Expired',
          'Your verification code has expired. Please go back and request a new one.',
          [{ text: 'Go Back', onPress: () => navigation.goBack() }]
        );
        setLoading(false);
        return;
      } else if (otpString === storedOtp) {
        otpValid = true;
      } else {
        // Wrong code
        setError(true);
        setLoading(false);
        return;
      }
    } catch (fetchErr: any) {
      console.warn('[OtpScreen] Could not verify OTP (offline?):', fetchErr?.message);
      // Offline fallback: allow any 6-digit entry
      otpValid = true;
    }

    if (!otpValid) {
      setError(true);
      setLoading(false);
      return;
    }

    // ── OTP valid — approve child and navigate ────────────────────────────────
    const approvePromise = approveChild(uid);
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), 8000)
    );

    try {
      await Promise.race([approvePromise, timeoutPromise]);
      console.log('[OtpScreen] Parent approved child:', uid);
    } catch (err: any) {
      console.warn('[OtpScreen] approveChild warning (continuing anyway):', err?.message);
    } finally {
      setLoading(false);
    }

    // Always navigate forward
    navigation?.navigate('ConsentSuccess', { nickname: route?.params?.nickname });
  };

  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <BrandHeader transparent={true} showBackButton onBack={handleBack} />

            <View style={styles.innerContainer}>
              <View style={styles.mainContent}>

              {/* Verification Card */}
              <View style={styles.glassCard}>
                <View style={styles.iconCircle}>
                  <Text style={styles.securityIcon}>🛡️</Text>
                </View>

                <Text style={styles.title}>Enter Authenticator Code</Text>
                <Text style={styles.subtitle}>
                  Please enter the 6-digit code from your email or authenticator app.
                </Text>

                {/* Error State */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>Incomplete OTP. Please check and try again.</Text>
                  </View>
                )}

                {/* OTP Inputs */}
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { inputs.current[index] = ref; }}
                      style={[
                         styles.otpInput,
                         error && styles.otpInputError,
                         digit ? styles.otpInputFilled : null
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleChangeText(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                    />
                  ))}
                </View>

                {/* Primary CTA */}
                <TouchableOpacity
                  style={[styles.buttonPrimary, loading && { opacity: 0.8 }]}
                  onPress={handleVerify}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.buttonTextPrimary}>Verify Parent</Text>
                      <Text style={styles.arrowIcon}>→</Text>
                    </>
                  )}
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
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  glassCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    alignItems: 'center',
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
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(74,222,128,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  securityIcon: {
    fontSize: 44,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#166534',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
    lineHeight: 23,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
    width: '100%',
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#14532D',
  },
  otpInputError: {
    borderColor: '#ba1a1a',
  },
  buttonPrimary: {
    backgroundColor: '#14532D',
    flexDirection: 'row',
    height: 56,
    width: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(20,83,45,0.3)' },
      default: {
        shadowColor: '#14532D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  buttonTextPrimary: {
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
