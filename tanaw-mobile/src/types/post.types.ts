import { UserRole } from './user.types';

export type PostVisibility = 'COMMUNITY' | 'PUBLIC';

export interface PostAuthor {
  id: string;
  tanawId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  role: UserRole;
  profilePhoto?: string | null;
}

export interface PostImage {
  id: string;
  url: string;
}

export interface Post {
  id: string;
  visibility: PostVisibility;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  images?: PostImage[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
}

export interface MyGroup {
  code: string;
  name: string;
  memberCount: number;
  postCount: number;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ToggleLikeResult {
  liked: boolean;
  likeCount: number;
}

export interface UserCard {
  id: string;
  tanawId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  role: UserRole;
  profilePhoto?: string | null;
  barangay?: { id: string; code: string; name: string } | null;
  isFollowedByMe: boolean;
  isSelf: boolean;
}
