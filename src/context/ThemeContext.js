import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const lightColors = {
  navy: '#032757',
  navyLight: '#0A3A73',
  gold: '#F6A400',
  goldLight: '#FBC358',
  background: '#FFFFFF',
  surface: '#F5F6F8',
  border: '#E2E5EA',
  textPrimary: '#111418',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',
  success: '#1E9E5A',
  error: '#D64545',
  warning: '#F6A400',
  disabled: '#C7CBD1',
};

export const darkColors = {
  navy: '#0A3A73',       // Dynamic brand blue accent in dark mode
  navyLight: '#1E40AF',
  gold: '#FBC358',
  goldLight: '#F6A400',
  background: '#121212', // Premium AMOLED dark background
  surface: '#1E1E1E',    // Dark card surface
  border: '#2C2C2C',    // Border tone
  textPrimary: '#F3F4F6', // High contrast white
  textSecondary: '#9CA3AF',
  textInverse: '#121212',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#FBBF24',
  disabled: '#4B5563',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await AsyncStorage.getItem('@dark_mode');
        if (stored === 'true') {
          setIsDarkMode(true);
        }
      } catch (e) {
        console.warn('Failed to load theme preference', e);
      }
    }
    loadTheme();
  }, []);

  const toggleDarkMode = async () => {
    try {
      const nextVal = !isDarkMode;
      setIsDarkMode(nextVal);
      await AsyncStorage.setItem('@dark_mode', nextVal ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if provider is missing
    return { isDarkMode: false, toggleDarkMode: () => {}, colors: lightColors };
  }
  return context;
};
