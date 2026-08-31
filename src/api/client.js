import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

// TODO: replace with your real Spring Boot base URL (staging/prod)
// While developing on a physical device with Expo Go, "localhost" will NOT work —
// use your machine's local network IP instead, e.g. http://192.168.1.42:8080
// Toggle this to true to run purely in frontend mock mode (no connection attempts).


// Set this to false when you want to connect your Spring Boot database.
export const IS_OFFLINE = false;

// Android uses 10.0.2.2 for localhost, iOS uses localhost
const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const BASE_URL = `http://${LOCAL_IP}:8084/api`;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request automatically
client.interceptors.request.use(async (config) => {
  if (IS_OFFLINE) {
    // Instantly reject request to bypass network socket connection entirely
    return Promise.reject(new Error('Running in offline/mock mode'));
  }
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central error handling — expand this as you learn your backend's error shape
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.message, error.config?.url);
    if (error.response?.status === 401) {
      // token expired/invalid — clear it, navigate user to Login from AuthContext
      await deleteToken();
    }
    
    // Graceful fallback for missing backend endpoints or type mismatch (500/404)
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn(`Endpoint ${error.config?.url} is missing or failing on the backend. Falling back gracefully.`);
      // Return a fake successful response with empty data to prevent the UI from crashing
      return Promise.resolve({ data: { items: [], content: [] } });
    }
    
    return Promise.reject(error);
  }
);

export default client;
