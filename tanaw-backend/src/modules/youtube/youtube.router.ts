import { Router } from 'express';
import * as youtubeController from './youtube.controller';

export const youtubeRouter = Router();

youtubeRouter.get('/city-videos', youtubeController.listCityVideos);
