import { Response, NextFunction } from 'express';
import { serviceRequestService } from '../services/serviceRequestService';
import { AuthenticatedRequest, ServiceRequestQuery, Priority } from '../types';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class ServiceRequestController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as ServiceRequestQuery;
      const result = await serviceRequestService.getAll(query);
      sendSuccess(res, result, 'Service requests retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await serviceRequestService.getById(req.params.id ?? '');
      sendSuccess(res, request, 'Service request retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const { title, description, priority, assignedTo } = req.body as {
        title: string;
        description: string;
        priority: Priority;
        assignedTo?: string;
      };

      const request = await serviceRequestService.create({
        title,
        description,
        priority,
        assignedTo,
        createdBy: req.user.id,
      });

      sendCreated(res, request, 'Service request created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const request = await serviceRequestService.update(
        req.params.id ?? '',
        req.body as Record<string, unknown>,
        req.user.id,
        req.user.role
      );

      sendSuccess(res, request, 'Service request updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      await serviceRequestService.delete(
        req.params.id ?? '',
        req.user.id,
        req.user.role
      );

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await serviceRequestService.getStats();
      sendSuccess(res, stats, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const serviceRequestController = new ServiceRequestController();
