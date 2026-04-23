import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, DigitalIdData } from '../../types/user.types';
import { PickedImage } from '../../utils/imagePicker.util';
import * as usersApi from '../../api/users.api';
import { logoutThunk, setUser } from './authSlice';

interface UserState {
  profile: User | null;
  digitalIdData: DigitalIdData | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  digitalIdData: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

export const fetchProfileThunk = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getProfile();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Failed to load profile');
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (dto: Parameters<typeof usersApi.updateProfile>[0], { rejectWithValue }) => {
    try {
      return await usersApi.updateProfile(dto);
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
      .addCase(fetchProfileThunk.fulfilled, (state, action) => { state.isLoading = false; state.profile = action.payload; })
      .addCase(fetchProfileThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(updateProfileThunk.pending, (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateProfileThunk.fulfilled, (state, action) => { state.isUpdating = false; state.profile = action.payload; })
      .addCase(updateProfileThunk.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; })
      .addCase(updateProfilePhotoThunk.pending, (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateProfilePhotoThunk.fulfilled, (state, action) => { state.isUpdating = false; state.profile = action.payload; })
      .addCase(updateProfilePhotoThunk.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload as string; })
      .addCase(fetchDigitalIdThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchDigitalIdThunk.fulfilled, (state, action) => { state.isLoading = false; state.digitalIdData = action.payload; })
      .addCase(fetchDigitalIdThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      // Clear user data on logout
      .addCase(logoutThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.rejected, () => initialState);
  },
});

export const { clearProfile, clearError } = userSlice.actions;
export default userSlice.reducer;
