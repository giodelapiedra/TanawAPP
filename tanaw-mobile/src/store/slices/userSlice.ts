import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '..';
import { DigitalIdData } from '../../types/user.types';
import { PickedImage } from '../../utils/imagePicker.util';
import * as usersApi from '../../api/users.api';
import { resolveApiError, type ResolvedApiError } from '../../utils/apiError.util';
import { loginThunk, logout, logoutThunk, setUser } from './authSlice';

interface UserState {
  digitalIdData: DigitalIdData | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: UserState = {
  digitalIdData: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

export const fetchProfileThunk = createAsyncThunk(
  'user/fetchProfile',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const profile = await usersApi.getProfile();
      const current = (getState() as RootState).auth.user;
      const currentUpdatedAt = current?.updatedAt ? new Date(current.updatedAt).getTime() : 0;
      const profileUpdatedAt = profile.updatedAt ? new Date(profile.updatedAt).getTime() : 0;

      if (!current || profileUpdatedAt >= currentUpdatedAt) {
        dispatch(setUser(profile));
      }
      return profile;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Failed to load profile');
    }
  }
);

// Reject with `ResolvedApiError` so the screen gets the same timeout/413/422
// awareness that the photo upload thunk already provides. The reducer extracts
// `.message` so consumers reading `state.error: string | null` keep working.
export const updateProfileThunk = createAsyncThunk<
  Awaited<ReturnType<typeof usersApi.updateProfile>>,
  Parameters<typeof usersApi.updateProfile>[0],
  { rejectValue: ResolvedApiError }
>(
  'user/updateProfile',
  async (dto, { dispatch, rejectWithValue }) => {
    try {
      const updated = await usersApi.updateProfile(dto);
      dispatch(setUser(updated));
      return updated;
    } catch (err: unknown) {
      return rejectWithValue(resolveApiError(err, 'Update failed'));
    }
  }
);

// Reject payload for the photo upload is a discriminated `ResolvedApiError`
// so the screen can show timeout / 413 / network-specific copy without
// re-deriving the kind of failure.
export const updateProfilePhotoThunk = createAsyncThunk<
  Awaited<ReturnType<typeof usersApi.updateProfilePhoto>>,
  PickedImage,
  { rejectValue: ResolvedApiError }
>(
  'user/updateProfilePhoto',
  async (image, { dispatch, rejectWithValue }) => {
    try {
      const updated = await usersApi.updateProfilePhoto(image);
      // Mirror into auth slice so any component selecting `auth.user` gets the new photo.
      dispatch(setUser(updated));
      const fresh = await usersApi.getProfile().catch(() => updated);
      dispatch(setUser(fresh));
      return fresh;
    } catch (err: unknown) {
      return rejectWithValue(resolveApiError(err, 'Upload failed'));
    }
  }
);

export const fetchDigitalIdThunk = createAsyncThunk(
  'user/fetchDigitalId',
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getDigitalIdData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Failed to load Digital ID');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfile: () => initialState,
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProfileThunk.fulfilled, (state) => { state.isLoading = false; })
      .addCase(fetchProfileThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(updateProfileThunk.pending, (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateProfileThunk.fulfilled, (state) => { state.isUpdating = false; })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message ?? action.error?.message ?? null;
      })
      .addCase(updateProfilePhotoThunk.pending, (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateProfilePhotoThunk.fulfilled, (state) => { state.isUpdating = false; })
      .addCase(updateProfilePhotoThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message ?? action.error?.message ?? null;
      })
      .addCase(fetchDigitalIdThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchDigitalIdThunk.fulfilled, (state, action) => { state.isLoading = false; state.digitalIdData = action.payload; })
      .addCase(fetchDigitalIdThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(logout, () => initialState)
      // Clear user data on logout
      .addCase(logoutThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.rejected, () => initialState)
      // Cross-slice sync: auth.user.profilePhoto is the canonical source.
      // The digital ID is fetched once on screen mount, so without this sync
      // the cached idData would keep showing the old photo until next refetch.
      // We mirror the new URL into digitalIdData here so the ID card and the
      // header avatar update in lockstep with auth.user.
      .addCase(setUser, (state, action) => {
        if (state.digitalIdData) {
          state.digitalIdData = {
            ...state.digitalIdData,
            profilePhoto: action.payload.profilePhoto ?? undefined,
          };
        }
      })
      // Same sync on login — `auth.user` is set via loginThunk.fulfilled
      // (not setUser), so we hook that case explicitly too.
      .addCase(loginThunk.fulfilled, (state, action) => {
        if (state.digitalIdData) {
          state.digitalIdData = {
            ...state.digitalIdData,
            profilePhoto: action.payload.user.profilePhoto ?? undefined,
          };
        }
      });
  },
});

export const { clearProfile, clearError } = userSlice.actions;
export default userSlice.reducer;
