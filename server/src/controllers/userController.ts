import { Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { AuthenticatedRequest, UserRole } from '../types';
import { sendSuccess, sendNoContent } from '../utils/response';

export class UserController {
  async getAll(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAll();
      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getById(req.params.id ?? '');
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.update(req.params.id ?? '', req.body as {
        name?: string;
        email?: string;
        role?: UserRole;
      });
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.delete(req.params.id ?? '');
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
