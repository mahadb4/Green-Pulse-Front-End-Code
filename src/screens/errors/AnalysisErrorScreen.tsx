import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';

export default function AnalysisErrorScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F2" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🌿</Text>
        <Text style={styles.headerTitle}>GreenPulse</Text>
      </View>

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
    backgroundColor: '#F6F7F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eff6e7',
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e09',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#D8E1D3',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2A1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#ba1a1a', // error
    borderRadius: 999,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ba1a1a', // error
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    color: '#ba1a1a', // error
    fontSize: 18,
    marginRight: 8,
  }
});
