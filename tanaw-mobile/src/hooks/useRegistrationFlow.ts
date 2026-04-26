import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../store';
import { registerThunk } from '../store/slices/authSlice';
import {
  registerSchema,
  toRegisterDto,
  STEP_FIELDS,
  REGISTER_FORM_DEFAULTS,
  RegisterFormData,
  RegisterStep,
} from '../schemas/auth.schema';

interface RegistrationFlow {
  form: ReturnType<typeof useForm<RegisterFormData>>;
  step: RegisterStep;
  goNext: () => Promise<void>;
  goBack: () => void;
  submit: () => Promise<void>;
  successTanawId: string | null;
  apiError: string | null;
  clearApiError: () => void;
  isSubmitting: boolean;
}

/**
 * Owns the entire registration flow state machine: form, step, server submit.
 * Screen consumes this and renders. Keeps RegisterScreen focused on layout.
 */
export function useRegistrationFlow(): RegistrationFlow {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector((s) => s.auth.isLoading);

  const form = useForm<RegisterFormData>({
    // `resolver` accepts any zod schema regardless of its inner shape; the
    // generic mismatch between the refined schema and useForm's TFieldValues
    // is a known RHF/zod limitation and safe to cast.
    resolver: zodResolver(registerSchema) as never,
    defaultValues: REGISTER_FORM_DEFAULTS,
    mode: 'onTouched',
  });

  const [step, setStep] = useState<RegisterStep>(1);
  const [successTanawId, setSuccessTanawId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const goNext = useCallback(async () => {
    const ok = await form.trigger(STEP_FIELDS[step]);
    if (!ok) return;
    if (step < 3) setStep((s) => (s + 1) as RegisterStep);
  }, [form, step]);

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => (s - 1) as RegisterStep);
  }, [step]);

  const submit = useCallback(async () => {
    setApiError(null);
    const ok = await form.trigger();
    if (!ok) return;
    const data = form.getValues();
    const result = await dispatch(registerThunk(toRegisterDto(data)));
    if (registerThunk.fulfilled.match(result)) {
      setSuccessTanawId(result.payload.tanawId);
    } else {
      setApiError((result.payload as string) ?? 'Registration failed. Please try again.');
    }
  }, [dispatch, form]);

  const clearApiError = useCallback(() => setApiError(null), []);

  return {
    form,
    step,
    goNext,
    goBack,
    submit,
    successTanawId,
    apiError,
    clearApiError,
    isSubmitting,
  };
}
