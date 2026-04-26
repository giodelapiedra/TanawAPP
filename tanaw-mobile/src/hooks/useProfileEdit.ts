import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  updateProfileThunk,
  fetchProfileThunk,
  clearError,
} from '../store/slices/userSlice';
import {
  updateProfileSchema,
  toUpdateProfileDto,
  profileDefaultsFromUser,
  UpdateProfileFormData,
} from '../schemas/profile.schema';

/**
 * Owns the profile-edit flow:
 *  - RHF + zod form, defaults sourced from canonical auth.user
 *  - Re-syncs form when auth.user changes (e.g. background refresh, photo upload)
 *  - Edit/View toggle with a dirty-aware Cancel
 *  - beforeRemove guard so the user can't lose unsaved changes by tapping back
 */
export function useProfileEdit() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const user = useAppSelector((s) => s.auth.user);
  const isUpdating = useAppSelector((s) => s.user.isUpdating);
  const apiError = useAppSelector((s) => s.user.error);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: profileDefaultsFromUser(user),
    mode: 'onTouched',
  });

  const [isEditing, setIsEditing] = useState(false);
  const isDirty = form.formState.isDirty;

  // Pull a fresh profile when the screen mounts so we're editing the latest
  // server state, not a cached `auth.user`. Mirror of the original screen behavior.
  useEffect(() => {
    dispatch(fetchProfileThunk());
  }, [dispatch]);

  // Re-sync the form whenever auth.user changes IF the user isn't actively
  // editing. While editing, we keep their in-progress values to avoid clobbering
  // their typing with a background refresh.
  useEffect(() => {
    if (isEditing) return;
    form.reset(profileDefaultsFromUser(user));
  }, [user, isEditing, form]);

  // Clear stale errors when leaving the screen.
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Block accidental navigation away when there are unsaved changes.
  // Catches: ScreenHeader back button, hardware back, swipe gesture.
  useEffect(() => {
    if (!isEditing || !isDirty) return;
    const sub = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Leave without saving?',
        [
          { text: 'Stay', style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });
    return sub;
  }, [navigation, isEditing, isDirty]);

  const startEditing = useCallback(() => {
    form.reset(profileDefaultsFromUser(user));
    setIsEditing(true);
  }, [form, user]);

  const cancelEditing = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Discard them?',
        [
          { text: 'Keep editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              form.reset(profileDefaultsFromUser(user));
              setIsEditing(false);
            },
          },
        ],
      );
      return;
    }
    setIsEditing(false);
  }, [form, user, isDirty]);

  const save = useCallback(async () => {
    const ok = await form.trigger();
    if (!ok) return;
    const result = await dispatch(updateProfileThunk(toUpdateProfileDto(form.getValues())));
    if (updateProfileThunk.fulfilled.match(result)) {
      // Reset baseline so isDirty turns false against the new saved values.
      form.reset(profileDefaultsFromUser(result.payload));
      setIsEditing(false);
    }
  }, [dispatch, form]);

  return {
    user,
    form,
    isEditing,
    isUpdating,
    isDirty,
    apiError,
    startEditing,
    cancelEditing,
    save,
  };
}
