import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

let LOCAL_API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

// Automatically detect host IP address when running inside Expo Go on LAN
const getAutoHostIp = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  const linkingUri = Constants.linkingUri;
  if (linkingUri) {
    const match = linkingUri.match(/:\/\/(.*?):/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return match[1];
    }
  }
  return null;
};

const autoHostIp = getAutoHostIp();
if (autoHostIp) {
  LOCAL_API_BASE = `http://${autoHostIp}:8000/api/v1`;
}

// Prefer explicitly defined `.env` URL, otherwise fallback to auto-detected IP / default LOCAL_API_BASE
const API_BASE = process.env.EXPO_PUBLIC_API_URL || LOCAL_API_BASE;

export const mobileApi = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

mobileApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
