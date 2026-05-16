import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import Screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NicknameScreen from '../screens/onboarding/NicknameScreen';
import OtpScreen from '../screens/consent/OtpScreen';
import VpcGateScreen from '../screens/onboarding/VpcGateScreen';
import DataReviewScreen from '../screens/consent/DataReviewScreen';
import ConsentSuccessScreen from '../screens/consent/ConsentSuccessScreen';

import GardenScreen from '../screens/main/GardenScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CameraScreen from '../screens/main/CameraScreen';
import PhotoPreviewScreen from '../screens/main/PhotoPreviewScreen';
import ProcessingScreen from '../screens/main/ProcessingScreen';
import ActionSuccessScreen from '../screens/main/ActionSuccessScreen';
import ActionRetryScreen from '../screens/main/ActionRetryScreen';
import ActionDetailScreen from '../screens/main/ActionDetailScreen';
import LevelUpScreen from '../screens/main/LevelUpScreen';

import ParentDashboardScreen from '../screens/parent/ParentDashboardScreen';

import OfflineErrorScreen from '../screens/errors/OfflineErrorScreen';
import PermissionErrorScreen from '../screens/errors/PermissionErrorScreen';
import AnalysisErrorScreen from '../screens/errors/AnalysisErrorScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#006e09',
        tabBarInactiveTintColor: '#68756B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EEF2EA',
          height: 60,
          paddingBottom: 8,
        }
      }}
    >
      <Tab.Screen 
        name="Garden" 
        component={GardenScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏡</Text> 
        }}
      />
      <Tab.Screen 
        name="Actions" 
        component={ActionDetailScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>☑️</Text> 
        }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text> 
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> 
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      {/* Onboarding Flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Nickname" component={NicknameScreen} />
      <Stack.Screen name="VpcGate" component={VpcGateScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="DataReview" component={DataReviewScreen} />
      <Stack.Screen name="ConsentSuccess" component={ConsentSuccessScreen} />

      {/* Main Flow (Tabs) */}
      <Stack.Screen name="Main" component={MainTabNavigator} />

      {/* Action Flow */}

      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="PhotoPreview" component={PhotoPreviewScreen} />
      <Stack.Screen name="Processing" component={ProcessingScreen} />
      <Stack.Screen name="ActionSuccess" component={ActionSuccessScreen} />
      <Stack.Screen name="ActionRetry" component={ActionRetryScreen} />
      <Stack.Screen name="LevelUp" component={LevelUpScreen} />

      {/* Parent Flow */}
      <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />

      {/* Error Flow */}
      <Stack.Screen name="OfflineError" component={OfflineErrorScreen} />
      <Stack.Screen name="PermissionError" component={PermissionErrorScreen} />
      <Stack.Screen name="AnalysisError" component={AnalysisErrorScreen} />
    </Stack.Navigator>
  );
}
