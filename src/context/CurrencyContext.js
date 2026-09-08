import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'ESP'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const stored = await AsyncStorage.getItem('@currency');
        if (stored === 'USD' || stored === 'ESP') {
          setCurrency(stored);
        }
      } catch (e) {
        console.warn('Failed to load currency setting', e);
      } finally {
        setLoading(false);
      }
    };
    loadCurrency();
  }, []);

  const changeCurrency = async (newCurrency) => {
    setCurrency(newCurrency);
    try {
      await AsyncStorage.setItem('@currency', newCurrency);
    } catch (e) {
      console.warn('Failed to save currency setting', e);
    }
  };

  const formatPrice = useCallback((priceInDollars) => {
    const val = Number(priceInDollars);
    if (isNaN(val)) return priceInDollars; // Return as-is if not a valid number (e.g. string with texts)

    if (currency === 'ESP') {
      const espVal = val / 1.6;
      return `₧${espVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    } else if (currency === 'NGN') {
      return `₦${val.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    } else {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);