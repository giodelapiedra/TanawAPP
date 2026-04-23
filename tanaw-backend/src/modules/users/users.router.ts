import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { uploadSingleImage } from '../../middleware/upload.middleware';
import { updateProfileSchema, registerDeviceTokenSchema } from './users.schema';
import * as usersController from './users.controller';

export const usersRouter = Router();

// All user routes are protected
usersRouter.use(authMiddleware);

usersRouter.get('/me', usersController.getMe);
usersRouter.patch('/me', validate(updateProfileSchema), usersController.updateMe);
usersRouter.post('/me/profile-photo', uploadSingleImage('photo'), usersController.updateProfilePhoto);
usersRouter.get('/me/digital-id', usersController.getDigitalId);
usersRouter.post('/me/accept-community-rules', usersController.acceptCommunityRules);
usersRouter.post('/device-token', validate(registerDeviceTokenSchema), usersController.registerDeviceToken);

// Public profile view — any authenticated user can look up another user's card
usersRouter.get('/:userId/public-profile', usersController.getPublicProfile);
