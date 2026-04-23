import { z } from 'zod';

export const listCityVideosQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(6),
});

export type ListCityVideosQueryDto = z.infer<typeof listCityVideosQuerySchema>;

export interface CityVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: string;
}
