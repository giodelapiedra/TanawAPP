import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util';
import { ListCityVideosQueryDto } from './youtube.schema';
import * as youtubeService from './youtube.service';

export async function listCityVideos(req: Request, res: Response) {
  const { limit } = req.query as unknown as ListCityVideosQueryDto;
  const data = await youtubeService.listCityVideos(limit);
  sendSuccess(res, data, 'City videos retrieved');
}
