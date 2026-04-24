import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  registerResidentSchema,
  registerBarangaySchema,
  registerEmployeeSchema,
  loginSchema,
  refreshSchema,
} from './auth.schema';
import * as authController from './auth.controller';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
authRouter.post('/register/resident', authLimiter, validate(registerResidentSchema), authController.registerResident);
authRouter.post('/register/barangay', authLimiter, validate(registerBarangaySchema), authController.registerBarangay);
authRouter.post('/register/employee', authLimiter, validate(registerEmployeeSchema), authController.registerEmployee);
authRouter.post('/login', authLimiter, validate(loginSchema), authController.login);
authRouter.post('/refresh', authLimiter, validate(refreshSchema), authController.refresh);

// Protected
authRouter.post('/logout', authMiddleware, authController.logout);
