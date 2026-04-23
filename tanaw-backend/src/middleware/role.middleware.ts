import { RequestHandler } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../utils/response.util';

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError('Access denied', 403);
    }

    next();
  };
}
