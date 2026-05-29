import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Platform
} from 'react-native';
import BrandHeader from '../../components/BrandHeader';

export default function AnalysisErrorScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      
      {/* Header */}
      <BrandHeader style={styles.header} transparent={true} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.mainIcon}>🧠</Text>
          </View>

          <Text style={styles.title}>Analysis Failed</Text>
          <Text style={styles.description}>
            Our carbon garden AI couldn't process this request right now. Give it a moment to clear its digital roots.
          </Text>

          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.buttonIcon}>🔄</Text>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  header: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)', boxShadow: '0 10px 25px rgba(22,163,74,0.08)' },
      default: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    }),
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 218, 214, 0.5)', // error-container/50
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mainIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#14532D',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 280,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ba1a1a', // error
    borderRadius: 999,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ba1a1a', // error
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    color: '#ba1a1a', // error
    fontSize: 18,
    marginRight: 8,
  }
});
