import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../store';
import { loginThunk, clearError } from '../store/slices/authSlice';
import {
  loginSchema,
  LoginFormData,
  LOGIN_FORM_DEFAULTS,
} from '../schemas/auth.schema';

interface LoginFlow {
  form: ReturnType<typeof useForm<LoginFormData>>;
  submit: () => Promise<void>;
  showPassword: boolean;
  togglePassword: () => void;
  apiError: string | null;
  clearApiError: () => void;
  isLoading: boolean;
  canSubmit: boolean;
}

/**
 * Owns the login form: RHF + zod, submits via loginThunk, surfaces auth.error.
 * Mirrors useRegistrationFlow so screens read the same shape across auth flows.
 */
export function useLoginFlow(): LoginFlow {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((s) => s.auth.isLoading);
  const apiError = useAppSelector((s) => s.auth.error);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: LOGIN_FORM_DEFAULTS,
    mode: 'onTouched',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Clear any leftover Redux auth error when the screen unmounts so the next
  // visit doesn't show a stale message.
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);
  const clearApiError = useCallback(() => dispatch(clearError()), [dispatch]);

  const submit = useCallback(async () => {
    const ok = await form.trigger();
    if (!ok) return;
    const { identifier, password } = form.getValues();
    await dispatch(loginThunk({ identifier: identifier.trim(), password }));
  }, [dispatch, form]);

  // Mirror previous LoginScreen behavior: button enables only when both fields
  // are non-empty (regardless of validation state) so the button visibly toggles
  // as the user types.
  const values = form.watch();
  const canSubmit =
    !!values.identifier?.trim() && !!values.password && !isLoading;

  return {
    form,
    submit,
    showPassword,
    togglePassword,
    apiError,
    clearApiError,
    isLoading,
    canSubmit,
  };
}
