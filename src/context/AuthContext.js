import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const setToken = async (token) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('authToken', token);
  } else {
    await SecureStore.setItemAsync('authToken', token);
  }
};

const getToken = async () => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem('authToken');
  } else {
    return await SecureStore.getItemAsync('authToken');
  }
};

const deleteToken = async () => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem('authToken');
  } else {
    await SecureStore.deleteItemAsync('authToken');
  }
};
import {
  login as loginApi,
  logout as logoutApi,
  loginWithGoogle,
  loginWithApple,
  loginWithFacebook,
  loginWithKingschat,
} from '../api/auth.api';
import { IS_OFFLINE } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      console.log('initAuth started');
      const startTime = Date.now();
      try {
        console.log('fetching onboardingCompleted');
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');
        console.log('onboardingCompleted fetched', onboardingCompleted);
        if (onboardingCompleted === 'true') {
          setIsOnboardingCompleted(true);
        }
        
        console.log('fetching authToken');
        const token = await getToken();
        console.log('authToken fetched');
        if (token) {
          setUser({ token });
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        console.log('initAuth finally block reached');
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 3000 - elapsed); 
        setTimeout(() => {
          console.log('setting isLoading to false');
          setIsLoading(false);
        }, delay);
      }
    }
    initAuth();
  }, []);

  const login = async (phoneOrEmail, password) => {
    try {
      const { data } = await loginApi(phoneOrEmail, password);
      await setToken(data.token);
      setUser(data.user ?? { token: data.token });
      setIsGuest(false);
      return data;
    } catch (e) {
      if (IS_OFFLINE || e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        console.warn('Backend server not reachable; logging in via mock session mode.');
        const mockData = {
          token: 'mock-jwt-token-demo',
          user: { id: 1, email: phoneOrEmail, name: 'Demo User', role: 'USER' },
        };
        await setToken(mockData.token);
        setUser(mockData.user);
        setIsGuest(false);
        return mockData;
      }
      throw e;
    }
  };

  const loginSocial = async (provider, mockToken) => {
    try {
      let response;
      if (provider === 'google') response = await loginWithGoogle(mockToken);
      else if (provider === 'apple') response = await loginWithApple(mockToken);
      else if (provider === 'facebook') response = await loginWithFacebook(mockToken);
      else if (provider === 'kingschat') response = await loginWithKingschat(mockToken);
      
      if (response && response.data) {
        const { data } = response;
        await setToken(data.token);
        setUser(data.user ?? { token: data.token });
        setIsGuest(false);
        return data;
      }
    } catch (e) {
      if (IS_OFFLINE || e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        console.warn(`${provider} backend auth unavailable; logging in via mock session mode.`);
        const mockData = {
          token: `mock-${provider}-token`,
          user: { id: 1, email: `user@${provider}.com`, name: `${provider} User`, role: 'USER' },
        };
        await setToken(mockData.token);
        setUser(mockData.user);
        setIsGuest(false);
        return mockData;
      }
      throw e;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // ignore network errors on logout — clear local session regardless
    }
    await deleteToken();
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
