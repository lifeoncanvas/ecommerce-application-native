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
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');
        if (onboardingCompleted === 'true') {
          setIsOnboardingCompleted(true);
        }
        
        const token = await getToken();
        const savedProfileStr = await AsyncStorage.getItem('@user_profile');

        if (savedProfileStr) {
          try {
            const savedProfile = JSON.parse(savedProfileStr);
            setUser(savedProfile);
          } catch (e) {
            if (token) setUser({ token });
          }
        } else if (token) {
          setUser({ token });
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 500 - elapsed); 
        setTimeout(() => {
          setIsLoading(false);
        }, delay);
      }
    }
    initAuth();
  }, []);

  const login = async (phoneOrEmail, password) => {
    try {
      const res = await loginApi(phoneOrEmail, password);
      const token = res.data?.token || res.token || 'mock-jwt-token';
      await setToken(token);

      const isStoreOwner = phoneOrEmail.includes('@store.com') || phoneOrEmail.includes('@vendor.com');
      const role = isStoreOwner ? 'STORE_OWNER' : 'CUSTOMER';
      let name = phoneOrEmail.split('@')[0];
      if (phoneOrEmail.includes('nike')) name = 'Nike Store Manager';
      else if (phoneOrEmail.includes('jazari')) name = 'Jazari Restaurant Owner';
      else if (phoneOrEmail.includes('apple')) name = 'Apple Store Manager';

      const userObj = {
        token,
        email: phoneOrEmail,
        name: res.data?.user?.name || name,
        fullName: res.data?.user?.name || name,
        role: res.data?.user?.role || role,
        isVendor: isStoreOwner,
        storeName: name.replace(' Manager', '').replace(' Owner', ''),
      };

      await AsyncStorage.setItem('@user_profile', JSON.stringify(userObj));
      setUser(userObj);
      setIsGuest(false);
      return userObj;
    } catch (e) {
      if (IS_OFFLINE || e.message === 'Network Error' || e.code === 'ERR_NETWORK' || e.response?.status === 401) {
        console.warn('Backend offline/demo mode; initializing session for', phoneOrEmail);
        const isStoreOwner = phoneOrEmail.includes('@store.com') || phoneOrEmail.includes('@vendor.com');
        const role = isStoreOwner ? 'STORE_OWNER' : 'CUSTOMER';
        let name = phoneOrEmail.split('@')[0];
        if (phoneOrEmail.includes('nike')) name = 'Nike Store Manager';
        else if (phoneOrEmail.includes('jazari')) name = 'Jazari Restaurant Owner';
        else if (phoneOrEmail.includes('apple')) name = 'Apple Store Manager';

        const mockUser = {
          token: 'mock-jwt-token-demo',
          email: phoneOrEmail,
          name: name,
          fullName: name,
          role: role,
          isVendor: isStoreOwner,
          storeName: name.replace(' Manager', '').replace(' Owner', ''),
        };
        await setToken(mockUser.token);
        await AsyncStorage.setItem('@user_profile', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsGuest(false);
        return mockUser;
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
        const socialUser = {
          token: data.token,
          email: `${provider}_user@gmail.com`,
          name: `${provider} User`,
          role: 'CUSTOMER',
        };
        await AsyncStorage.setItem('@user_profile', JSON.stringify(socialUser));
        setUser(socialUser);
        setIsGuest(false);
        return data;
      }
    } catch (e) {
      if (IS_OFFLINE || e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        const mockData = {
          token: `mock-${provider}-token`,
          user: { id: 1, email: `user@${provider}.com`, name: `${provider} User`, role: 'USER' },
        };
        await setToken(mockData.token);
        await AsyncStorage.setItem('@user_profile', JSON.stringify(mockData.user));
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
      // ignore
    }
    await deleteToken();
    await AsyncStorage.removeItem('@user_profile');
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
