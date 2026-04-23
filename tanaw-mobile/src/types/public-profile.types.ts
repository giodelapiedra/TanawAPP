import { UserRole, UserStatus, Barangay } from './user.types';

export interface PublicUserProfile {
  id: string;
  tanawId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  role: UserRole;
  status: UserStatus;
  email: string;
  phone: string;
  profilePhoto?: string | null;
  createdAt: string;
  barangay?: Pick<Barangay, 'code' | 'name'> | null;
  followerCount: number;
  followingCount: number;
  isFollowedByMe: boolean;
  isSelf: boolean;
}
