import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import SplashScreen from '../screens/auth/SplashScreen';

export default function RootNavigator() {
  const { user, isGuest, isOnboardingCompleted, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user || isGuest ? (
        <MainTabNavigator />
      ) : (
        <AuthStack isOnboardingCompleted={isOnboardingCompleted} />
      )}
    </NavigationContainer>
  );
}
