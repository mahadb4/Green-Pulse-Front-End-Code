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
  Keyboard
} from 'react-native';

export default function OtpScreen({ navigation }: any) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    setError(false);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if there is text
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError(true);
      return;
    }

    // Success, move to ConsentSuccess screen
    if (navigation && navigation.navigate) {
      navigation.navigate('ConsentSuccess');
    }
  };

  const handleBack = () => {
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
          <View style={styles.innerContainer}>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>GreenPulse</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.mainContent}>
              {/* Decorative Background Elements */}
              <View style={styles.bgBlobTop} />
              <View style={styles.bgBlobBottom} />

              {/* Verification Card */}
              <View style={styles.card}>
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
                  style={styles.verifyButton}
                  onPress={handleVerify}
                  activeOpacity={0.8}
                >
                  <Text style={styles.verifyButtonText}>Verify</Text>
                  <Text style={styles.arrowIcon}>→</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#006e09',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006e09',
  },
  headerSpacer: {
    width: 40,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bgBlobTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 300,
    backgroundColor: '#38ad32',
    borderRadius: 150,
    opacity: 0.05,
  },
  bgBlobBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 400,
    height: 400,
    backgroundColor: '#94f68b',
    borderRadius: 200,
    opacity: 0.05,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    padding: 24,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#2F8F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 5,
    zIndex: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2F8F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  securityIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#ffdad6',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    color: '#93000a',
    fontSize: 14,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D8E1D3',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#006e09',
  },
  otpInputError: {
    borderColor: '#ba1a1a',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#38ad32',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F8F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  verifyButtonText: {
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
