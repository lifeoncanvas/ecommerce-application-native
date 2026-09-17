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

  const isVendor = user?.isVendor || user?.role === 'STORE_OWNER' ||
    user?.email?.includes('@store.com') || user?.email?.includes('@vendor.com');

  return (
    <NavigationContainer>
      {user || isGuest ? (
        <MainTabNavigator isVendor={isVendor} />
      ) : (
        <AuthStack isOnboardingCompleted={isOnboardingCompleted} />
      )}
    </NavigationContainer>
  );
}

