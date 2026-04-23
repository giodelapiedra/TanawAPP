import { Router } from 'express';
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

// Public
authRouter.post('/register/resident', validate(registerResidentSchema), authController.registerResident);
authRouter.post('/register/barangay', validate(registerBarangaySchema), authController.registerBarangay);
authRouter.post('/register/employee', validate(registerEmployeeSchema), authController.registerEmployee);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);

// Protected
authRouter.post('/logout', authMiddleware, authController.logout);
