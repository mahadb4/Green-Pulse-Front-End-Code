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
import { auth, db } from '../../services/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function NicknameScreen({ navigation }: any) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!nickname.trim()) {
      Alert.alert('Please enter a nickname', 'You need a nickname to continue.');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'Not signed in. Please restart the app.');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'children', uid), {
        nickname: nickname.trim(),
      });
      if (navigation && navigation.navigate) {
        navigation.navigate('VpcGate');
      }
    } catch (error) {
      console.error('Failed to save nickname:', error);
      Alert.alert('Error', 'Could not save your nickname. Please try again.');
    } finally {
      setLoading(false);
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
            
            <View style={styles.card}>
              {/* Subtle Decorative Element */}
              <View style={styles.decorativeBlob} />

              {/* Header Section */}
              <View style={styles.headerContainer}>
                <Text style={styles.brandText}>GreenPulse</Text>
                <Text style={styles.titleText}>Choose your garden name</Text>
              </View>

              {/* Form / Input Section */}
              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>@</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter a fun nickname"
                    placeholderTextColor="#68756B"
                    value={nickname}
                    onChangeText={setNickname}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoText}>Use letters and numbers only.</Text>
                </View>
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
  brandText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#006e09',
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
