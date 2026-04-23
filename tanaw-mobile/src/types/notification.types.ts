import { PostAuthor } from './post.types';

export type NotificationType = 'POST_COMMENT' | 'POST_LIKE';

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  actor: PostAuthor;
  type: NotificationType;
  postId: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
}
