import { z } from 'zod';
import { cursorPaginationSchema } from '../../utils/pagination.util';

export const listNotificationsQuerySchema = cursorPaginationSchema;

export type ListNotificationsQueryDto = z.infer<typeof listNotificationsQuerySchema>;
