import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { groupsRouter } from './modules/groups/groups.router';
import { feedRouter } from './modules/feed/feed.router';
import { followsRouter } from './modules/follows/follows.router';
import { notificationsRouter } from './modules/notifications/notifications.router';
import { youtubeRouter } from './modules/youtube/youtube.router';
import { sendSuccess, sendError } from './utils/response.util';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/groups', groupsRouter);
app.use('/api/v1/feed', feedRouter);
app.use('/api/v1/follows', followsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/youtube', youtubeRouter);

app.get('/health', (_req, res) => {
  sendSuccess(res, {
    status: 'ok',
    app: 'TANAW One App',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }, 'Server is healthy');
});

app.use((_req, res) => {
  sendError(res, 'Route not found', 404);
});

app.use(errorMiddleware);

export default app;
