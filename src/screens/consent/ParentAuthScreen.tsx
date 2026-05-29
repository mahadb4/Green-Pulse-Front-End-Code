import React, { useEffect, useRef, useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { setupParentTotp, verifyParentTotp, TotpSetup } from '../../services/gardenService';
import BrandHeader from '../../components/BrandHeader';
import AnimatedBackground from '../../components/AnimatedBackground';
import QrCode from '../../components/QrCode';

export default function ParentAuthScreen({ navigation, route }: any) {
  const purpose: 'consent' | 'dashboard' = route?.params?.purpose ?? 'consent';
  const onSuccessRoute: string = route?.params?.onSuccessRoute ?? (purpose === 'consent' ? 'ConsentSuccess' : 'ParentDashboard');
  const nickname = route?.params?.nickname;

  const [setup, setSetup] = useState<TotpSetup | null>(null);
  const [setupError, setSetupError] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const loadSetup = async () => {
    setSetupError('');
    try {
      const s = await setupParentTotp();
      setSetup(s);
      // First-time enrolment: show the QR by default. Returning parents go straight to code entry.
      setShowQr(!s.alreadyEnrolled);
    } catch (e: any) {
      setSetupError(cleanMsg(e, 'Could not start parent verification. Check your connection and try again.'));
    }
  };

  useEffect(() => { loadSetup(); }, []);

  const handleChange = (text: string, i: number) => {
    setError('');
    const next = [...otp];
    next[i] = text.replace(/[^0-9]/g, '').slice(-1);
    setOtp(next);
    if (text && i < 5) inputs.current[i + 1]?.focus();
  };
  const handleKey = (e: any, i: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the full 6-digit code.'); return; }
    setVerifying(true);
    setError('');
    try {
      const res = await verifyParentTotp(code, purpose);
      if (res.valid) {
        navigation.navigate(onSuccessRoute, { nickname });
      } else {
        setError('Incorrect code. Check your authenticator app and try again.');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch (e: any) {
      setError(cleanMsg(e, 'Verification failed. Please try again.'));
    } finally {
      setVerifying(false);
    }
  };

  const isConsent = purpose === 'consent';

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <BrandHeader transparent showBackButton onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <View style={styles.iconCircle}><Text style={styles.icon}>🔐</Text></View>
              <Text style={styles.title}>{isConsent ? 'Parent Verification' : 'Parent Access'}</Text>
              <Text style={styles.subtitle}>
                {isConsent
                  ? 'Verify with a parent/guardian authenticator app to approve this account.'
                  : 'Enter the code from your authenticator app to open the parent dashboard.'}
              </Text>

              {setupError ? (
                <View style={styles.errBox}>
                  <Text style={styles.errText}>{setupError}</Text>
                  <TouchableOpacity onPress={loadSetup} style={styles.retryBtn}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
                </View>
              ) : !setup ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color="#16A34A" />
                  <Text style={styles.loadingText}>Preparing secure verification…</Text>
                </View>
              ) : (
                <>
                  {showQr && (
                    <View style={styles.enrollBox}>
                      <Text style={styles.stepLabel}>1 · Add to your authenticator</Text>
                      <Text style={styles.stepHint}>
                        Open Google Authenticator or Authy → add account → scan this QR (or enter the key).
                      </Text>
                      <View style={styles.qrWrap}>
                        <QrCode value={setup.otpauthUrl} size={200} />
                      </View>
                      <Text style={styles.keyLabel}>Setup key</Text>
                      <Text selectable style={styles.keyText}>{setup.secret}</Text>
                      <Text style={[styles.stepLabel, { marginTop: 18 }]}>2 · Enter the 6-digit code</Text>
                    </View>
                  )}

                  {!showQr && setup.alreadyEnrolled && (
                    <TouchableOpacity onPress={() => setShowQr(true)} style={styles.readd}>
                      <Text style={styles.readdText}>Lost access? Re-add to authenticator</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.otpRow}>
                    {otp.map((d, i) => (
                      <TextInput
                        key={i}
                        ref={(r) => { inputs.current[i] = r; }}
                        style={[styles.otpInput, d ? styles.otpFilled : null, error ? styles.otpError : null]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={d}
                        onChangeText={(t) => handleChange(t, i)}
                        onKeyPress={(e) => handleKey(e, i)}
                      />
                    ))}
                  </View>

                  {error ? <Text style={styles.errInline}>⚠️ {error}</Text> : null}

                  <TouchableOpacity
                    style={[styles.btn, verifying && { opacity: 0.8 }]}
                    onPress={handleVerify}
                    disabled={verifying}
                    activeOpacity={0.85}
                  >
                    {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isConsent ? 'Verify Parent →' : 'Unlock Dashboard →'}</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function cleanMsg(e: any, fallback: string): string {
  return (e?.message || fallback).replace(/^FirebaseError:\s*/, '');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24, zIndex: 10 },
  card: {
    width: '100%', maxWidth: 440, alignSelf: 'center', borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)', padding: 28, borderWidth: 1.5, borderColor: 'rgba(255,255,255,1)',
    alignItems: 'center',
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)', boxShadow: '0 20px 40px rgba(22,163,74,0.15)' },
      default: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
    }),
  },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(74,222,128,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  icon: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: '900', color: '#14532D', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#166534', opacity: 0.85, textAlign: 'center', lineHeight: 21, marginBottom: 22, paddingHorizontal: 6 },

  loadingWrap: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  loadingText: { color: '#166534', fontWeight: '600' },
  errBox: { width: '100%', backgroundColor: 'rgba(220,38,38,0.08)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(220,38,38,0.25)' },
  errText: { color: '#991B1B', fontSize: 14, textAlign: 'center', fontWeight: '600', marginBottom: 10 },
  retryBtn: { paddingVertical: 8, paddingHorizontal: 20, backgroundColor: '#14532D', borderRadius: 999 },
  retryText: { color: '#fff', fontWeight: '800' },

  enrollBox: { width: '100%', alignItems: 'center', marginBottom: 8 },
  stepLabel: { fontSize: 14, fontWeight: '900', color: '#14532D', alignSelf: 'flex-start' },
  stepHint: { fontSize: 13, color: '#166534', lineHeight: 19, marginTop: 4, marginBottom: 14 },
  qrWrap: { padding: 10, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  keyLabel: { fontSize: 11, fontWeight: '800', color: '#68756B', marginTop: 14, letterSpacing: 1 },
  keyText: { fontSize: 16, fontWeight: '800', color: '#14532D', letterSpacing: 2, marginTop: 4, textAlign: 'center' },

  readd: { marginBottom: 16 },
  readdText: { color: '#166534', fontWeight: '700', fontSize: 13, textDecorationLine: 'underline' },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 14, width: '100%' },
  otpInput: {
    width: 46, height: 56, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 1.5, borderColor: '#A7F3D0',
    borderRadius: 14, fontSize: 24, fontWeight: 'bold', color: '#1F2A1F', textAlign: 'center',
  },
  otpFilled: { borderColor: '#14532D' },
  otpError: { borderColor: '#ba1a1a' },
  errInline: { color: '#991B1B', fontSize: 13, fontWeight: '600', marginBottom: 12, textAlign: 'center' },

  btn: {
    backgroundColor: '#14532D', height: 56, width: '100%', borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 4,
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(20,83,45,0.3)' },
      default: { shadowColor: '#14532D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
    }),
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
