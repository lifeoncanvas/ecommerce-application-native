import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const lightColors = {
  // Primary - Royal Blue
  blue50: '#E6EBF2',
  blue200: '#6B8AB8',
  blue500: '#032757', 
  blue500Alt: '#032757', 
  blue700: '#032757',
  blue900: '#010E2A',

  // Accent - Gold
  gold50: '#FEF6E0',
  gold200: '#F9CE6B',
  gold400: '#F6A400',
  gold600: '#B87A00',
  gold800: '#7A4F00',

  // Neutrals
  white: '#FFFFFF',
  grey50: '#F9FAFB',
  grey200: '#E5E7EB',
  grey400: '#9CA3AF',
  grey600: '#6B7280',
  grey900: '#111827',

  // Semantic
  success: '#16A34A',
  error: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',

  // Theme Compatibility Mappings
  navy: '#032757',        // Blue 500
  navyLight: '#6B8AB8',   // Blue 200
  gold: '#F6A400',        // Gold 400
  goldLight: '#FEF6E0',   // Gold 50
  background: '#FFFFFF',  // White
  surface: '#F9FAFB',     // Grey 50
  border: '#E5E7EB',      // Grey 200
  textPrimary: '#111827', // Grey 900
  textSecondary: '#6B7280', // Grey 600
  textInverse: '#FFFFFF',
  disabled: '#9CA3AF',
};

export const darkColors = {
  // Primary - Royal Blue (Dark equivalents)
  blue50: '#1E293B',
  blue200: '#334155',
  blue500: '#60A5FA', 
  blue500Alt: '#60A5FA', 
  blue700: '#2563EB',
  blue900: '#1D4ED8',

  // Accent - Gold
  gold50: '#451A03',
  gold200: '#78350F',
  gold400: '#FBBF24',
  gold600: '#F59E0B',
  gold800: '#D97706',

  // Neutrals
  white: '#121212',
  grey50: '#1E1E1E',
  grey200: '#2C2C2C',
  grey400: '#4B5563',
  grey600: '#9CA3AF',
  grey900: '#F3F4F6',

  // Semantic
  success: '#22C55E',
  error: '#EF4444',
  warning: '#FBBF24',
  info: '#3B82F6',

  // Compatibility Mappings
  navy: '#60A5FA',
  navyLight: '#3B82F6',
  gold: '#FBBF24',
  goldLight: '#451A03',
  background: '#121212',
  surface: '#1E1E1E',
  border: '#2C2C2C',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textInverse: '#121212',
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
