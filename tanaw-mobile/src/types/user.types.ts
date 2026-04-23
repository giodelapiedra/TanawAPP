export type UserRole =
  | 'RESIDENT'
  | 'BARANGAY_OFFICIAL'
  | 'GOVERNMENT_EMPLOYEE'
  | 'SUPER_ADMIN';

export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type Gender = 'MALE' | 'FEMALE';

export interface Barangay {
  id: string;
  code: string;
  name: string;
  zipCode?: string;
  isActive: boolean;
}

export interface Address {
  id: string;
  userId: string;
  houseNo?: string;
  street?: string;
  city: string;
  province: string;
  zipCode: string;
}

export interface User {
  id: string;
  tanawId: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthDate: string;
  gender: Gender;
  profilePhoto?: string;
  barangayId?: string;
  barangay?: Barangay;
  employeeCode?: string;
  department?: string;
  position?: string;
  acceptedCommunityRulesAt?: string | null;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface DigitalIdData {
  tanawId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  role: UserRole;
  status: UserStatus;
  profilePhoto?: string;
  birthDate: string;
  createdAt: string;
  barangay?: { code: string; name: string };
  address?: { city: string };
}
