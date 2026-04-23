import { z } from 'zod';

const baseRegistration = {
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^09\d{9}$/, 'Must be a valid PH mobile number (09XXXXXXXXX)'),
  password: z.string().min(8, 'Minimum 8 characters').max(64),
  firstName: z.string().min(1, 'First name is required').max(60).trim(),
  middleName: z.string().max(60).trim().optional(),
  lastName: z.string().min(1, 'Last name is required').max(60).trim(),
  suffix: z.string().max(10).optional(),
  birthDate: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid date format')
    .transform((v) => new Date(v)),
  gender: z.enum(['MALE', 'FEMALE']),
  barangayCode: z.string().min(1, 'Barangay code is required'),
  street: z.string().optional(),
  houseNo: z.string().optional(),
};

export const registerResidentSchema = z.object({
  ...baseRegistration,
});

export const registerBarangaySchema = z.object({
  ...baseRegistration,
  position: z.string().min(1, 'Position is required'),
});

export const registerEmployeeSchema = z.object({
  ...baseRegistration,
  employeeCode: z.string().min(1, 'Employee code is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email, phone, or TANAW ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterResidentDto = z.infer<typeof registerResidentSchema>;
export type RegisterBarangayDto = z.infer<typeof registerBarangaySchema>;
export type RegisterEmployeeDto = z.infer<typeof registerEmployeeSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;
