import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

let LOCAL_API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

// Automatically detect the host IP address if running inside Expo Go on LAN
const debuggerHost = Constants.expoConfig?.hostUri;
if (debuggerHost) {
  const ip = debuggerHost.split(':')[0];
  LOCAL_API_BASE = `http://${ip}:8000/api/v1`;
}

// Read from `.env` file if explicitly provided, otherwise fallback to auto-detected local IP
const API_BASE = process.env.EXPO_PUBLIC_API_URL || LOCAL_API_BASE;

export const mobileApi = axios.create({
  baseURL: API_BASE,
});

mobileApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
