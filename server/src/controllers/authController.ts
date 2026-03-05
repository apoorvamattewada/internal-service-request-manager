import { Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils/response';

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body as {
        name: string;
        email: string;
        password: string;
        role?: string;
      };

      const { user, token } = await authService.register({ name, email, password, role: role as never });

      sendCreated(res, { user, token }, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const { user, token } = await authService.login({ email, password });

      sendSuccess(res, { user, token }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not found in request');
      }

      const user = await authService.getUserById(req.user.id);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
