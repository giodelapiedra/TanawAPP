import { z } from 'zod';

const PHONE_REGEX = /^09\d{9}$/;

// Optional text field that accepts an empty string from a controlled input.
// Without `.or(z.literal(''))`, an empty string from a TextInput would fail
// `optional()` because zod treats '' as a present-but-invalid value.
const optionalText = z.string().trim().optional().or(z.literal(''));

export const registerSchema = z
  .object({
    // Step 1 — personal info
    firstName: z.string().trim().min(1, 'Required'),
    middleName: optionalText,
    lastName: z.string().trim().min(1, 'Required'),
    suffix: optionalText,
    birthDate: z
      .string()
      .min(1, 'Select complete date')
      .refine(
        (s) => !s.includes('--') && s.split('-').every((p) => p.length > 0),
        { message: 'Select complete date' },
      ),
    gender: z.enum(['MALE', 'FEMALE'], { message: 'Select gender' }),

    // Step 2 — contact & address
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    phone: z.string().regex(PHONE_REGEX, 'Format: 09XXXXXXXXX'),
    barangayCode: z.string().min(1, 'Select your barangay'),
    houseNo: optionalText,
    street: optionalText,

    // Step 3 — password
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// DTO sent to the backend — confirmPassword is a UI-only concern.
// Empty optional strings are normalized to undefined before submit
// (see toRegisterDto below).
export type RegisterResidentDto = {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  barangayCode: string;
  street?: string;
  houseNo?: string;
};

export function toRegisterDto(data: RegisterFormData): RegisterResidentDto {
  const blank = (s?: string) => (s && s.trim().length > 0 ? s.trim() : undefined);
  return {
    email: data.email,
    phone: data.phone,
    password: data.password,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    middleName: blank(data.middleName),
    suffix: blank(data.suffix),
    birthDate: data.birthDate,
    gender: data.gender,
    barangayCode: data.barangayCode,
    houseNo: blank(data.houseNo),
    street: blank(data.street),
  };
}

export type RegisterStep = 1 | 2 | 3;

// Field arrays per step — used by useRegistrationFlow to call form.trigger
// on the current step's fields only (not the entire form).
export const STEP_FIELDS: Record<RegisterStep, (keyof RegisterFormData)[]> = {
  1: ['firstName', 'middleName', 'lastName', 'suffix', 'birthDate', 'gender'],
  2: ['email', 'phone', 'barangayCode', 'houseNo', 'street'],
  3: ['password', 'confirmPassword'],
};

export const REGISTER_FORM_DEFAULTS: RegisterFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  birthDate: '',
  // Default to '' so the controlled Dropdown is happy; zod will reject '' via the enum check.
  gender: '' as unknown as RegisterFormData['gender'],
  email: '',
  phone: '',
  barangayCode: '',
  houseNo: '',
  street: '',
  password: '',
  confirmPassword: '',
};

// ─── Login ───────────────────────────────────────────────
// Identifier accepts email, phone, or TANAW ID — backend resolves the format.
// Light client-side validation only: both fields must be present. Length and
// password-strength rules belong on the backend so older accounts can still log in.
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email, phone, or TANAW ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export type LoginDto = LoginFormData;

export const LOGIN_FORM_DEFAULTS: LoginFormData = {
  identifier: '',
  password: '',
};
