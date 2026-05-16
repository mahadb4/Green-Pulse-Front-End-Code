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
  Keyboard
} from 'react-native';

export default function DataReviewScreen({ navigation }: any) {
  const [email, setEmail] = useState('');

  const handleSendOtp = () => {
    // Navigate to OTP Screen
    if (navigation && navigation.navigate) {
      navigation.navigate('Otp');
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
          <View style={styles.innerContainer}>
            
            {/* Brand Header */}
            <View style={styles.header}>
              <Text style={styles.brandIcon}>🍃</Text>
              <Text style={styles.brandText}>GreenPulse</Text>
            </View>

            <View style={styles.mainContent}>
              {/* Header Section */}
              <View style={styles.titleSection}>
                <View style={styles.iconCircle}>
                  <Text style={styles.shieldIcon}>🛡️</Text>
                </View>
                <Text style={styles.titleText}>Parent Verification</Text>
                <Text style={styles.subtitleText}>
                  Please enter a parent or guardian's email address to continue setting up your account.
                </Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Parent's Email Address</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.mailIcon}>✉️</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="parent@example.com"
                      placeholderTextColor="#68756B"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Security Notice */}
                <View style={styles.securityNotice}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <View style={styles.securityTextContainer}>
                    <Text style={styles.securityTitle}>Secure Verification</Text>
                    <Text style={styles.securityText}>
                      We only use this for identity verification. Data is never used for marketing.
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionGroup}>
                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleSendOtp}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>Send OTP</Text>
                    <Text style={styles.arrowIcon}>→</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.secondaryButton} 
                    onPress={handleCancel}
                  >
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
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
  },
  brandIcon: {
    fontSize: 32,
    color: '#006e09',
    marginRight: 8,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    letterSpacing: -0.5,
  },
  mainContent: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e9f0e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  shieldIcon: {
    fontSize: 40,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
    borderColor: '#D8E1D3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3f4a3a',
    marginBottom: 8,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E1D3',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  mailIcon: {
    fontSize: 20,
    color: '#68756B',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2A1F',
    height: '100%',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6e7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  lockIcon: {
    fontSize: 20,
    marginRight: 16,
    marginTop: 2,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 14,
    color: '#68756B',
    lineHeight: 20,
  },
  actionGroup: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#006e09',
    flexDirection: 'row',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#68756B',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
