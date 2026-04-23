import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util';
import { listCityVideosQuerySchema } from './youtube.schema';
import * as youtubeService from './youtube.service';

export async function listCityVideos(req: Request, res: Response) {
  const { limit } = listCityVideosQuerySchema.parse(req.query);
  const data = await youtubeService.listCityVideos(limit);
  sendSuccess(res, data, 'City videos retrieved');
}
