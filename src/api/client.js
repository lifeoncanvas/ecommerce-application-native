import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// TODO: replace with your real Spring Boot base URL (staging/prod)
// While developing on a physical device with Expo Go, "localhost" will NOT work —
// use your machine's local network IP instead, e.g. http://192.168.1.42:8080
// Toggle this to true to run purely in frontend mock mode (no connection attempts).
// Set this to false when you want to connect your Spring Boot database.
export const IS_OFFLINE = false;

export const BASE_URL = 'http://192.168.1.108:8080/api';

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
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central error handling — expand this as you learn your backend's error shape
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // token expired/invalid — clear it, navigate user to Login from AuthContext
      await SecureStore.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  }
);

export default client;
