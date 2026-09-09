import React, { useEffect, Component } from 'react';
import { LogBox, ActivityIndicator, View, Text, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import RootNavigator from './src/navigation/RootNavigator';
import { registerForPushNotificationsAsync } from './src/utils/notificationManager';
import { ThemeProvider } from './src/context/ThemeContext';
import { TabBarVisibilityProvider } from './src/context/TabBarVisibilityContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import SplashScreen from './src/screens/auth/SplashScreen';

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

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFFCEB' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#010E2A', marginBottom: 12, textAlign: 'center' }}>
            Licht Marketing
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#DC2626', marginBottom: 8, textAlign: 'center' }}>
            Application Error Caught
          </Text>
          <Text style={{ fontSize: 13, color: '#4B5563', textAlign: 'center', marginBottom: 20, paddingHorizontal: 16 }}>
            {this.state.error?.toString() || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#1A2C5B', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 24 }}
            onPress={() => {
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.location.reload();
              } else {
                this.setState({ hasError: false, error: null });
              }
            }}
          >
            <Text style={{ color: '#F6A400', fontWeight: 'bold', fontSize: 15 }}>Reload Application</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.backgroundColor = '#112347';
    }
    registerForPushNotificationsAsync();
  }, []);

  const isReady = fontsLoaded;

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <TabBarVisibilityProvider>
              <CurrencyProvider>
                <WishlistProvider>
                  <CartProvider>
                    <StatusBar style="light" />
                    <RootNavigator />
                  </CartProvider>
                </WishlistProvider>
              </CurrencyProvider>
            </TabBarVisibilityProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
