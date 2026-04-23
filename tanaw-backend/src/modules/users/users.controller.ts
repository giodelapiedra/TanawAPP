import { Request, Response } from 'express';
import { sendSuccess, AppError } from '../../utils/response.util';
import * as usersService from './users.service';

export async function getMe(req: Request, res: Response) {
  const data = await usersService.getProfile(req.user!.userId);
  sendSuccess(res, data, 'Profile retrieved');
}

export async function getPublicProfile(req: Request, res: Response) {
  const targetId = String(req.params.userId);
  const data = await usersService.getPublicProfile(req.user!.userId, targetId);
  sendSuccess(res, data, 'Profile retrieved');
}

export async function updateMe(req: Request, res: Response) {
  const data = await usersService.updateProfile(req.user!.userId, req.body);
  sendSuccess(res, data, 'Profile updated successfully');
}

export async function updateProfilePhoto(req: Request, res: Response) {
  if (!req.file) throw new AppError('Photo is required (field name: photo)', 400);
  const data = await usersService.updateProfilePhoto(req.user!.userId, req.file);
  sendSuccess(res, data, 'Profile photo updated');
}

export async function getDigitalId(req: Request, res: Response) {
  const data = await usersService.getDigitalId(req.user!.userId);
  sendSuccess(res, data, 'Digital ID data retrieved');
}

export async function acceptCommunityRules(req: Request, res: Response) {
  const data = await usersService.acceptCommunityRules(req.user!.userId);
  sendSuccess(res, data, 'Community rules accepted');
}

export async function registerDeviceToken(req: Request, res: Response) {
  const data = await usersService.registerDeviceToken(req.user!.userId, req.body);
  sendSuccess(res, data, 'Device token registered');
}
