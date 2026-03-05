import { serviceRequestRepository } from '../repositories/serviceRequestRepository';
import { IServiceRequestDocument } from '../models/ServiceRequest';
import { Priority, Status, ServiceRequestQuery, PaginatedResponse, UserRole } from '../types';
import { NotFoundError, ForbiddenError } from '../utils/errors';

interface CreateRequestPayload {
  title: string;
  description: string;
  priority: Priority;
  assignedTo?: string;
  createdBy: string;
}

interface UpdateRequestPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  assignedTo?: string | null;
}

export class ServiceRequestService {
  async getAll(query: ServiceRequestQuery): Promise<PaginatedResponse<IServiceRequestDocument>> {
    return serviceRequestRepository.findAll(query);
  }

  async getById(id: string): Promise<IServiceRequestDocument> {
    if (!serviceRequestRepository.isValidObjectId(id)) {
      throw new NotFoundError('Service Request');
    }

    const request = await serviceRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundError('Service Request');
    }

    return request;
  }

  async create(data: CreateRequestPayload): Promise<IServiceRequestDocument> {
    return serviceRequestRepository.create(data);
  }

  async update(
    id: string,
    data: UpdateRequestPayload,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<IServiceRequestDocument> {
    if (!serviceRequestRepository.isValidObjectId(id)) {
      throw new NotFoundError('Service Request');
    }

    const existing = await serviceRequestRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Service Request');
    }

    // Employees can only update their own requests; admins can update any
    const isOwner = existing.createdBy.toString() === requestingUserId ||
      (typeof existing.createdBy === 'object' && '_id' in existing.createdBy &&
        existing.createdBy._id.toString() === requestingUserId);

    if (requestingUserRole !== UserRole.ADMIN && !isOwner) {
      throw new ForbiddenError('You can only update your own service requests');
    }

    // Employees cannot change status to Closed (only admins can)
    if (data.status === Status.CLOSED && requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Only admins can close service requests');
    }

    const updated = await serviceRequestRepository.update(id, data);
    if (!updated) {
      throw new NotFoundError('Service Request');
    }

    return updated;
  }

  async delete(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole
  ): Promise<void> {
    if (!serviceRequestRepository.isValidObjectId(id)) {
      throw new NotFoundError('Service Request');
    }

    const existing = await serviceRequestRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Service Request');
    }

    const isOwner = existing.createdBy.toString() === requestingUserId ||
      (typeof existing.createdBy === 'object' && '_id' in existing.createdBy &&
        existing.createdBy._id.toString() === requestingUserId);

    if (requestingUserRole !== UserRole.ADMIN && !isOwner) {
      throw new ForbiddenError('You can only delete your own service requests');
    }

    await serviceRequestRepository.delete(id);
  }

  async getStats(): Promise<Record<string, number>> {
    return serviceRequestRepository.countByStatus();
  }
}

export const serviceRequestService = new ServiceRequestService();
