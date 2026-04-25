import { RequestHandler } from 'express';
import { TokenPayload, verifyAccessToken } from '../utils/jwt.util';
import { AppError } from '../utils/response.util';
import { prisma } from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, tanawId: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Invalid or inactive account', 401);
    }

    req.user = { userId: user.id, tanawId: user.tanawId, role: user.role };
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid or expired token', 401);
  }
};
