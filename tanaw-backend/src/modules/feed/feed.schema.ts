import { z } from 'zod';
import { cursorPaginationSchema } from '../../utils/pagination.util';

export { cursorPaginationSchema as listQuerySchema } from '../../utils/pagination.util';
export type { CursorPaginationDto as ListQueryDto } from '../../utils/pagination.util';

export const createPublicPostSchema = z.object({
  content: z.string().max(1800, 'Post too long (max ~300 words)').trim().default(''),
});

export const discoverUsersQuerySchema = cursorPaginationSchema.extend({
  q: z.string().trim().optional(),
});

export type CreatePublicPostDto = z.infer<typeof createPublicPostSchema>;
export type DiscoverUsersQueryDto = z.infer<typeof discoverUsersQuerySchema>;
