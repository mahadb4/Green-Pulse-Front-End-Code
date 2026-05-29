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
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import AnimatedBackground from '../../components/AnimatedBackground';

// Simple email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function StudentInfoScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'First name required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name required.';
    if (!email.trim() || !emailRegex.test(email.trim())) newErrors.email = 'Valid email required.';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    // Prevent duplicate email registration
    // 1) Check Firebase Auth sign‑in methods
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email.trim());
      if (methods && methods.length > 0) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered. Please log in instead.' }));
        return;
      }
    } catch (authCheckErr: any) {
      console.warn('[StudentInfo] Auth duplicate check error:', authCheckErr?.message);
    }
    // 2) Check Firestore for existing child document with same email
    try {
      const q = query(collection(db, 'children'), where('email', '==', email.trim()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered. Please log in instead.' }));
        return;
      }
    } catch (fsCheckErr: any) {
      console.warn('[StudentInfo] Firestore duplicate check error:', fsCheckErr?.message);
    }

    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      // Create child profile document – mirrors sign‑in‑anon flow
      const profileData = {
        uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        email: email.trim(),
        createdAt: serverTimestamp(),
        username: '',
        parentName: '',
        parentEmail: '',
        parentVerified: false,
        parent_verified: false,
        lastLogin: serverTimestamp(),
        // placeholder fields used elsewhere
        energy_points: 0,
        current_streak: 0,
        parent_approved: false,
        nickname: null,
        garden_id: `garden_${uid}`,
        last_action_at: null,
        fcm_token: null,
      };
      console.log('[DEBUG] Writing to Firestore path: children/', uid, 'with data:', JSON.stringify(profileData));
      await setDoc(doc(db, 'children', uid), profileData, { merge: true });
      console.log('[DEBUG] Firestore write SUCCESS for uid:', uid);
      // Create the student's garden document
      await setDoc(doc(db, 'gardens', `garden_${uid}`), {
        garden_health: 0,
        garden_stage: 'seed',
        member_count: 0,
        nutrient_level: 0,
        water_level: 0,
        action_queue: [],
        owner_uid: uid,
        total_xp: 0,
        level: 1,
        createdAt: serverTimestamp(),
      });
      console.log('[DEBUG] Garden created for uid:', uid);
      // Continue onboarding – next step is username selection
      await sendEmailVerification(cred.user);
          navigation.navigate('Nickname');
    } catch (e: any) {
      console.warn('[StudentInfo] sign‑up error:', e);
      Alert.alert('Sign‑up failed', e.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
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
              <View style={styles.header}>
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>Enter your details to get started</Text>
              </View>

              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    placeholder="John"
                    placeholderTextColor="#68756B"
                    value={firstName}
                    onChangeText={t => { setFirstName(t); setErrors(prev => ({ ...prev, firstName: '' })); }}
                    style={styles.input}
                    autoCapitalize="words"
                  />
                </View>
                {errors.firstName ? <Text style={styles.errorText}>⚠️ {errors.firstName}</Text> : null}
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    placeholder="Doe"
                    placeholderTextColor="#68756B"
                    value={lastName}
                    onChangeText={t => { setLastName(t); setErrors(prev => ({ ...prev, lastName: '' })); }}
                    style={styles.input}
                    autoCapitalize="words"
                  />
                </View>
                {errors.lastName ? <Text style={styles.errorText}>⚠️ {errors.lastName}</Text> : null}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    placeholder="hero@example.com"
                    placeholderTextColor="#68756B"
                    value={email}
                    onChangeText={t => { setEmail(t); setErrors(prev => ({ ...prev, email: '' })); }}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>⚠️ {errors.email}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#68756B"
                    value={password}
                    onChangeText={t => { setPassword(t); setErrors(prev => ({ ...prev, password: '' })); }}
                    style={styles.input}
                    secureTextEntry
                  />
                </View>
                {errors.password ? <Text style={styles.errorText}>⚠️ {errors.password}</Text> : null}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#68756B"
                    value={confirmPassword}
                    onChangeText={t => { setConfirmPassword(t); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                    style={styles.input}
                    secureTextEntry
                  />
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>⚠️ {errors.confirmPassword}</Text> : null}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.8 }]}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Create Account</Text>
                    <Text style={styles.buttonArrow}>→</Text>
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
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
      web: { backdropFilter: 'blur(24px)', boxShadow: '0 20px 40px rgba(22,163,74,0.15)' },
      default: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#166534',
    opacity: 0.8,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#14532D', marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { fontSize: 18, marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1F2A1F', height: '100%' },
  errorText: { fontSize: 12, color: '#ba1a1a', marginTop: 4, marginLeft: 4 },
  button: {
    backgroundColor: '#006e09',
    flexDirection: 'row',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    ...Platform.select({
      web: { boxShadow: '0 8px 20px rgba(0,110,9,0.3)' },
      default: {
        shadowColor: '#006e09',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  buttonArrow: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
});