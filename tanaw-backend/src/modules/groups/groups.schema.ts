import { z } from 'zod';

export { cursorPaginationSchema as listQuerySchema } from '../../utils/pagination.util';
export type { CursorPaginationDto as ListQueryDto } from '../../utils/pagination.util';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(1800, 'Post too long (max ~300 words)').trim(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(1800, 'Post too long (max ~300 words)').trim(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long').trim(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type CreateCommentDto = z.infer<typeof createCommentSchema>;
