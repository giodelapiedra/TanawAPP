import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user.types';
import * as authApi from '../../api/auth.api';
import * as usersApi from '../../api/users.api';
import { setToken, getToken, clearAuthTokens } from '../../utils/storage';
import type { RegisterResidentDto } from '../../schemas/auth.schema';

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

// Backend returns the created User but no tokens — registration does not
// authenticate the session. The RegisterScreen shows the new TANAW ID and
// the user logs in afterwards.
export const registerThunk = createAsyncThunk<
  User,
  RegisterResidentDto,
  { rejectValue: string }
>(
  'auth/register',
  async (dto, { rejectWithValue }) => {
    try {
      return await authApi.registerResident(dto);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = e.response?.data?.message
        ?? (e.message === 'Network Error' ? 'Cannot connect to server. Make sure the backend is running.' : 'Registration failed');
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
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      const status = e.response?.status;
      if (status === 401 || status === 403) {
        try { await clearAuthTokens(); } catch {}
        return rejectWithValue({ message: 'Session expired', clearSession: true });
      }
      return rejectWithValue({
        message: 'Cannot verify session. Please check your connection.',
        clearSession: false,
      });
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
      // Register — surfaces isLoading so the screen's submit button can show
      // a spinner. Does NOT set isAuthenticated; the user logs in afterwards.
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? null;
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
      .addCase(checkAuthThunk.rejected, (state, action) => {
        const payload = action.payload as { clearSession?: boolean } | undefined;
        state.isCheckingAuth = false;
        if (payload?.clearSession !== false) {
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
        }
      });
  },
});

export const { logout, setUser, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
