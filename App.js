import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import RootNavigator from './src/navigation/RootNavigator';
import { registerForPushNotificationsAsync } from './src/utils/notificationManager';
import { ThemeProvider } from './src/context/ThemeContext';

// Silence the Expo Go push token warning to prevent LogBox blocker overlay
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
]);

const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('expo-notifications: Android Push notifications')
  ) {
    return;
  }
  originalConsoleError(...args);
};

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <WishlistProvider>
            <CartProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </CartProvider>
          </WishlistProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
