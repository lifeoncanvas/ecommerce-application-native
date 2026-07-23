import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  login as loginApi,
  logout as logoutApi,
  loginWithGoogle,
  loginWithApple,
  loginWithFacebook,
} from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const startTime = Date.now();
      try {
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');
        if (onboardingCompleted === 'true') {
          setIsOnboardingCompleted(true);
        }
        
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          setUser({ token });
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 2000 - elapsed); // Enforce a 2-second minimum duration for splash animations
        setTimeout(() => {
          setIsLoading(false);
        }, delay);
      }
    }
    initAuth();
  }, []);

  const login = async (phoneOrEmail, password, mockData = null) => {
    // Backend connection check (Commented for now):
    /*
    const { data } = await loginApi(phoneOrEmail, password);
    await SecureStore.setItemAsync('authToken', data.token);
    setUser(data.user ?? { token: data.token });
    setIsGuest(false);
    return data;
    */

    // Active Mock Bypass:
    const mockUser = mockData || {
      id: 'mock-user-' + Math.floor(Math.random() * 1000),
      name: 'Premium Member',
      phone: phoneOrEmail.includes('@') ? '' : phoneOrEmail,
      email: phoneOrEmail.includes('@') ? phoneOrEmail : 'user@local.com',
      provider: 'credentials',
    };
    setUser(mockUser);
    setIsGuest(false);
    return { user: mockUser, token: 'mock-jwt-token' };
  };

  const loginSocial = async (provider, mockToken) => {
    // Backend connection check (Commented for now):
    /*
    let response;
    if (provider === 'google') response = await loginWithGoogle(mockToken);
    else if (provider === 'apple') response = await loginWithApple(mockToken);
    else if (provider === 'facebook') response = await loginWithFacebook(mockToken);
    const { data } = response;
    await SecureStore.setItemAsync('authToken', data.token);
    setUser(data.user ?? { token: data.token });
    setIsGuest(false);
    return data;
    */

    // Active Mock Bypass:
    const mockUser = {
      id: 'mock-' + provider + '-' + Math.floor(Math.random() * 1000),
      name: provider.charAt(0).toUpperCase() + provider.slice(1) + ' User',
      email: `${provider}user@local.com`,
      provider: provider,
    };
    setUser(mockUser);
    setIsGuest(false);
    return { user: mockUser, token: 'mock-social-jwt' };
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // ignore network errors on logout — clear local session regardless
    }
    await SecureStore.deleteItemAsync('authToken');
    setUser(null);
    setIsGuest(false);
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      setIsOnboardingCompleted(true);
    } catch (error) {
      console.error('Failed to save onboarding state', error);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isOnboardingCompleted,
        isLoading,
        login,
        loginSocial,
        logout,
        setUser,
        setIsGuest,
        completeOnboarding,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
