import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  login as loginApi,
  logout as logoutApi,
  loginWithGoogle,
  loginWithApple,
  loginWithFacebook,
  loginWithKingschat,
  loginWithFirebase,
} from '../api/auth.api';

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
        const token = await SecureStore.getItemAsync('authToken');
        console.log('authToken fetched');
        if (token) {
          setUser({ token });
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        console.log('initAuth finally block reached');
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 2000 - elapsed); 
        setTimeout(() => {
          console.log('setting isLoading to false');
          setIsLoading(false);
        }, delay);
      }
    }
    initAuth();
  }, []);

  const login = async (phoneOrEmail, password) => {
    const { data } = await loginApi(phoneOrEmail, password);
    await SecureStore.setItemAsync('authToken', data.token);
    setUser(data.user ?? { token: data.token });
    setIsGuest(false);
    return data;
  };

  const loginFirebase = async (idToken) => {
    const { data } = await loginWithFirebase(idToken);
    await SecureStore.setItemAsync('authToken', data.token);
    setUser(data.user ?? { token: data.token });
    setIsGuest(false);
    return data;
  };

  const loginSocial = async (provider, mockToken) => {
    let response;
    if (provider === 'google') response = await loginWithGoogle(mockToken);
    else if (provider === 'apple') response = await loginWithApple(mockToken);
    else if (provider === 'facebook') response = await loginWithFacebook(mockToken);
    else if (provider === 'kingschat') response = await loginWithKingschat(mockToken);
    
    if (response && response.data) {
      const { data } = response;
      await SecureStore.setItemAsync('authToken', data.token);
      setUser(data.user ?? { token: data.token });
      setIsGuest(false);
      return data;
    }
    throw new Error('Social login failed');
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
        loginFirebase,
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
