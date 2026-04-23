import { Response } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function sendSuccess(res: Response, data: any, message: string, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode: number = 400, errors?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? null,
  });
}
