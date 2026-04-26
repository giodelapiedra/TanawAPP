import { z } from 'zod';
import type { User } from '../types/user.types';

const optionalText = z.string().trim().optional().or(z.literal(''));

/**
 * Schema for the patch payload sent by PersonalInformationScreen.
 * Mirrors the registration name/address fields so an edit can never
 * write a value that would have failed initial registration.
 */
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'Required'),
  middleName: optionalText,
  lastName: z.string().trim().min(1, 'Required'),
  suffix: optionalText,
  houseNo: optionalText,
  street: optionalText,
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// What the API receives. Empty optional strings are stripped so the backend
// can distinguish "field not set" from "user cleared it".
export type UpdateProfileDto = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  street?: string;
  houseNo?: string;
};

export function toUpdateProfileDto(data: UpdateProfileFormData): UpdateProfileDto {
  const blank = (s?: string) => (s && s.trim().length > 0 ? s.trim() : undefined);
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    middleName: blank(data.middleName),
    suffix: blank(data.suffix),
    houseNo: blank(data.houseNo),
    street: blank(data.street),
  };
}

/**
 * Derive form defaults from the canonical auth.user. Used both as initial
 * defaults for useForm and by useProfileEdit's reset effect that re-syncs
 * the form when auth.user changes (e.g. after a server-side refresh).
 */
export function profileDefaultsFromUser(user: User | null): UpdateProfileFormData {
  return {
    firstName: user?.firstName ?? '',
    middleName: user?.middleName ?? '',
    lastName: user?.lastName ?? '',
    suffix: user?.suffix ?? '',
    houseNo: user?.address?.houseNo ?? '',
    street: user?.address?.street ?? '',
  };
}
