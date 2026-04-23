import { Platform } from 'react-native';

// Expo SDK 54 uses sync API for SecureStore
// Web uses localStorage
export const setToken = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, value); } catch {}
    return;
  }
  const SecureStore = require('expo-secure-store');
  SecureStore.setItem(key, value);
};

export const getToken = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  const SecureStore = require('expo-secure-store');
  return SecureStore.getItem(key) ?? null;
};

export const removeToken = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(key); } catch {}
    return;
  }
  const SecureStore = require('expo-secure-store');
  SecureStore.deleteItem(key);
};

export const clearAuthTokens = async (): Promise<void> => {
  await removeToken('accessToken');
  await removeToken('refreshToken');
};
