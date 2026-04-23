import { AppError } from '../../utils/response.util';
import { CityVideo } from './youtube.schema';

const CITY_CHANNEL_VIDEOS_URL = 'https://www.youtube.com/@CityGovernmentofTanauan/videos';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

interface CacheEntry {
  fetchedAt: number;
  videos: CityVideo[];
}
const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: CacheEntry | null = null;

interface VideoRenderer {
  videoId?: string;
  title?: { runs?: Array<{ text?: string }>; simpleText?: string };
  publishedTimeText?: { simpleText?: string };
}

function extractVideos(html: string): CityVideo[] {
  const match = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
  if (!match) return [];

  let data: unknown;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return [];
  }

  const tabs =
    (data as { contents?: { twoColumnBrowseResultsRenderer?: { tabs?: unknown[] } } })
      ?.contents?.twoColumnBrowseResultsRenderer?.tabs ?? [];

  const videos: CityVideo[] = [];
  for (const tab of tabs) {
    const tr = (tab as { tabRenderer?: { content?: { richGridRenderer?: { contents?: unknown[] } } } })
      .tabRenderer;
    const contents = tr?.content?.richGridRenderer?.contents;
    if (!contents) continue;

    for (const c of contents) {
      const v = (c as { richItemRenderer?: { content?: { videoRenderer?: VideoRenderer } } })
        .richItemRenderer?.content?.videoRenderer;
      if (!v?.videoId) continue;
      const title = v.title?.runs?.[0]?.text ?? v.title?.simpleText ?? '';
      if (!title) continue;

      videos.push({
        id: v.videoId,
        title,
        thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
        publishedAt: v.publishedTimeText?.simpleText ?? '',
      });
    }
    if (videos.length > 0) break;
  }
  return videos;
}

async function fetchAllVideos(): Promise<CityVideo[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let html: string;
  try {
    const res = await fetch(CITY_CHANNEL_VIDEOS_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`YouTube channel ${res.status}`);
    html = await res.text();
  } finally {
    clearTimeout(timeout);
  }

  return extractVideos(html);
}

export async function listCityVideos(limit: number): Promise<CityVideo[]> {
  const now = Date.now();
  if (!cache || now - cache.fetchedAt > CACHE_TTL_MS) {
    try {
      const videos = await fetchAllVideos();
      if (videos.length === 0 && !cache) {
        throw new AppError('Unable to load city videos', 502);
      }
      if (videos.length > 0) {
        cache = { fetchedAt: now, videos };
      }
    } catch (err) {
      if (cache) return cache.videos.slice(0, limit);
      if (err instanceof AppError) throw err;
      throw new AppError('Unable to load city videos', 502);
    }
  }
  return cache!.videos.slice(0, limit);
}
