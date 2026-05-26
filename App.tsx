import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, View, ActivityIndicator, Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { signInAnonymously } from './src/services/authService';
import { ensureGardenExists } from './src/services/gardenService';

function App() { console.log('App render start');
  const [isReady, setIsReady] = useState(false);
  const [initStatus, setInitStatus] = useState('Starting up...');

  useEffect(() => {
    async function initialize() {
      try {
        setInitStatus('Signing in...');
        await signInAnonymously();
        setInitStatus('Loading garden...');
        await ensureGardenExists('garden_karachi_01');
        setInitStatus('Ready!');
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsReady(true);
      }
    }
    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F6F7F2', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#006e09', marginBottom: 20 }}>🌱 GreenPulse</Text>
        <ActivityIndicator size="large" color="#38AD32" />
        <Text style={{ marginTop: 16, fontSize: 14, color: '#68756B' }}>{initStatus}</Text>
      </View>
    );
  }

  return (
    Platform.OS === 'web' ? (
      <View style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </View>
    ) : (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    )
  );
}

export default App;
