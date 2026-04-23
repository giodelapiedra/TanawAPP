import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util';
import * as authService from './auth.service';

export async function registerResident(req: Request, res: Response) {
  const user = await authService.registerResident(req.body);
  sendSuccess(res, user, 'Registration successful! Your TANAW ID has been created.', 201);
}

export async function registerBarangay(req: Request, res: Response) {
  const user = await authService.registerBarangay(req.body);
  sendSuccess(res, user, 'Barangay official registered successfully.', 201);
}

export async function registerEmployee(req: Request, res: Response) {
  const user = await authService.registerEmployee(req.body);
  sendSuccess(res, user, 'Government employee registered successfully.', 201);
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  sendSuccess(res, result, 'Login successful');
}

export async function refresh(req: Request, res: Response) {
  const tokens = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, tokens, 'Token refreshed');
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.user!.userId);
  sendSuccess(res, null, 'Logged out successfully');
}
