import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user.types';
import * as authApi from '../../api/auth.api';
import * as usersApi from '../../api/users.api';
import { setToken, getToken, clearAuthTokens } from '../../utils/storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (dto: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.login(dto);
      await setToken('accessToken', data.accessToken);
      await setToken('refreshToken', data.refreshToken);
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = e.response?.data?.message
        ?? (e.message === 'Network Error' ? 'Cannot connect to server. Make sure the backend is running.' : 'Login failed');
      return rejectWithValue(msg);
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  // Call backend logout — ignore any errors
  try { await authApi.logoutApi(); } catch {}
  // Clear local tokens — ignore any errors
  try { await clearAuthTokens(); } catch {}
  return true;
});

export const checkAuthThunk = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await getToken('accessToken');
      const refreshToken = await getToken('refreshToken');
      if (!accessToken || !refreshToken) {
        return rejectWithValue('No tokens');
      }
      const user = await usersApi.getProfile();
      return { accessToken, refreshToken, user };
    } catch {
      try { await clearAuthTokens(); } catch {}
      return rejectWithValue('Session expired');
    }
  }
);

const loggedOutState: AuthState = { ...initialState, isCheckingAuth: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: () => loggedOutState,
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout — ALWAYS reset state whether fulfilled or rejected
      .addCase(logoutThunk.fulfilled, () => loggedOutState)
      .addCase(logoutThunk.rejected, () => loggedOutState)
      // Check auth
      .addCase(checkAuthThunk.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { logout, setUser, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
