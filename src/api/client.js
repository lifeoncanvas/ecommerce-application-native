import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// TODO: replace with your real Spring Boot base URL (staging/prod)
// While developing on a physical device with Expo Go, "localhost" will NOT work —
// use your machine's local network IP instead, e.g. http://192.168.1.42:8080
export const BASE_URL = 'http://192.168.1.42:8080/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request automatically
client.interceptors.request.use(async (config) => {
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
