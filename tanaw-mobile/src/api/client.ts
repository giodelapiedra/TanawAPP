import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, setToken, clearAuthTokens } from '../utils/storage';

// On Android emulator, 10.0.2.2 maps to host machine's localhost
// On web, use localhost directly
// On physical device, use the LAN IP from .env
const DEFAULT_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/api/v1'
  : 'http://localhost:3000/api/v1';

const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

console.log('[API] Base URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await getToken('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;

        await setToken('accessToken', newAccess);
        await setToken('refreshToken', newRefresh);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original);
      } catch {
        await clearAuthTokens();
        const { store } = await import('../store');
        const { logout } = await import('../store/slices/authSlice');
        store.dispatch(logout());
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
