import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').max(60).trim().optional(),
  middleName: z.string().max(60).trim().optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').max(60).trim().optional(),
  suffix: z.string().max(10).optional(),
  street: z.string().optional(),
  houseNo: z.string().optional(),
});

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
  platform: z.enum(['ios', 'android']),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type RegisterDeviceTokenDto = z.infer<typeof registerDeviceTokenSchema>;
