import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, setToken, clearAuthTokens } from '../utils/storage';

// Production backend on Ubuntu (tanaw-api.tanauancity.com → 72.61.213.48 via Cloudflare).
// To switch back to local dev, comment out PROD_URL and uncomment LOCAL_URL below.
const PROD_URL = 'https://tanaw-api.tanauancity.com/api/v1';

// Local dev fallback (commented out while pointing to Ubuntu):
// On Android emulator, 10.0.2.2 maps to host machine's localhost.
// On web, use localhost directly. On physical device, use LAN IP via EXPO_PUBLIC_API_URL.
// const LOCAL_URL = Platform.OS === 'android'
//   ? 'http://10.0.2.2:3000/api/v1'
//   : 'http://localhost:3000/api/v1';

const DEFAULT_URL = PROD_URL;

const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

console.log('[API] Base URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

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
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshToken = await getToken('refreshToken');
            if (!refreshToken) throw new Error('No refresh token');

            const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            const { accessToken, refreshToken: nextRefreshToken } = res.data.data;

            await setToken('accessToken', accessToken);
            await setToken('refreshToken', nextRefreshToken);

            const { store } = await import('../store');
            const { setTokens } = await import('../store/slices/authSlice');
            store.dispatch(setTokens({ accessToken, refreshToken: nextRefreshToken }));

            return { accessToken, refreshToken: nextRefreshToken };
          })().finally(() => {
            refreshPromise = null;
          });
        }

        const { accessToken: newAccess } = await refreshPromise;

        original.headers = original.headers ?? {};
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
