import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { listCityVideosQuerySchema } from './youtube.schema';
import * as youtubeController from './youtube.controller';

export const youtubeRouter = Router();

youtubeRouter.get('/city-videos', validate(listCityVideosQuerySchema, 'query'), youtubeController.listCityVideos);
