import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/response.util';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err instanceof ZodError) {
    const errors = err.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    sendError(res, 'Validation failed', 422, errors);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 'Record already exists', 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Record not found', 404);
      return;
    }
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  sendError(res, 'Internal server error', 500);
}
