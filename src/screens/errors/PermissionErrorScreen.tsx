import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Linking
} from 'react-native';

export default function PermissionErrorScreen({ navigation }: any) {
  const openSettings = () => {
    Linking.openSettings();
  };

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
            <Text style={styles.mainIcon}>🔒</Text>
          </View>

          <Text style={styles.title}>Access Restricted</Text>
          <Text style={styles.description}>
            We need permission to access your camera to scan leaves and track your carbon offset.
          </Text>

          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={openSettings}
          >
            <Text style={styles.buttonIcon}>⚙️</Text>
            <Text style={styles.buttonText}>Open Settings</Text>
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
    backgroundColor: '#e3ebdc', // surface-container-high
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mainIcon: {
    fontSize: 48,
    color: '#68756B',
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
    backgroundColor: '#dee5d6', // surface-container-highest
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#171d14', // on-surface
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  }
});
