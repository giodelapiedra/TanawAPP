import apiClient from './client';

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: string;
}

export async function listCityVideos(limit = 6): Promise<YouTubeVideo[]> {
  const res = await apiClient.get('/youtube/city-videos', { params: { limit } });
  return res.data.data as YouTubeVideo[];
}
