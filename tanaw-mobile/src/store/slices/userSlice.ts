import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DigitalIdData } from '../../types/user.types';
import { PickedImage } from '../../utils/imagePicker.util';
import * as usersApi from '../../api/users.api';
import { logout, logoutThunk, setUser } from './authSlice';

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
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const profile = await usersApi.getProfile();
      dispatch(setUser(profile));
      return profile;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Failed to load profile');
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (dto: Parameters<typeof usersApi.updateProfile>[0], { dispatch, rejectWithValue }) => {
    try {
      const updated = await usersApi.updateProfile(dto);
      dispatch(setUser(updated));
      return updated;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Update failed');
    }
  }
);

export const updateProfilePhotoThunk = createAsyncThunk(
  'user/updateProfilePhoto',
  async (image: PickedImage, { dispatch, rejectWithValue }) => {
    try {
      const updated = await usersApi.updateProfilePhoto(image);
      // Mirror into auth slice so any component selecting `auth.user` gets the new photo.
      dispatch(setUser(updated));
      return updated;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Upload failed');
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
      .addCase(updateProfileThunk.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; })
      .addCase(updateProfilePhotoThunk.pending, (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateProfilePhotoThunk.fulfilled, (state) => { state.isUpdating = false; })
      .addCase(updateProfilePhotoThunk.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; })
      .addCase(fetchDigitalIdThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchDigitalIdThunk.fulfilled, (state, action) => { state.isLoading = false; state.digitalIdData = action.payload; })
      .addCase(fetchDigitalIdThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(logout, () => initialState)
      // Clear user data on logout
      .addCase(logoutThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.rejected, () => initialState);
  },
});

export const { clearProfile, clearError } = userSlice.actions;
export default userSlice.reducer;
