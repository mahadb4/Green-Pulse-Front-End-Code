import 'react-native-gesture-handler';
console.log('[GREENPULSE_BOOT] index.js loading');

import { registerRootComponent } from 'expo';
import React from 'react';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.log('[GREENPULSE_BOOT_ERROR] React Error Boundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#ffcccc', padding: 20}}>
          <Text style={{color:'red', fontWeight:'bold', fontSize:18, marginBottom: 10}}>App Crashed</Text>
          <Text style={{color:'red'}}>{String(this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

let App;
try {
  App = require('./App').default;
  console.log('[GREENPULSE_BOOT] App module loaded successfully');
} catch (e) {
  console.log('[GREENPULSE_BOOT_ERROR] Failed to load App module:', e);
  App = () => (
    <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#ffcccc', padding: 20}}>
      <Text style={{color:'red', fontWeight:'bold', fontSize:18}}>Module Load Error</Text>
      <Text style={{color:'red'}}>{String(e)}</Text>
    </View>
  );
}

function Root() {
  console.log('[GREENPULSE_BOOT] Root rendering');
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

registerRootComponent(Root);
