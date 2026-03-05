import { FilterQuery, Types } from 'mongoose';
import { ServiceRequest, IServiceRequestDocument } from '../models/ServiceRequest';
import { Priority, Status, ServiceRequestQuery, PaginatedResponse } from '../types';

interface CreateServiceRequestData {
  title: string;
  description: string;
  priority: Priority;
  status?: Status;
  createdBy: string;
  assignedTo?: string;
}

interface UpdateServiceRequestData {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  assignedTo?: string | null;
}

export class ServiceRequestRepository {
  async findById(id: string): Promise<IServiceRequestDocument | null> {
    return ServiceRequest.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');
  }

  async findAll(query: ServiceRequestQuery): Promise<PaginatedResponse<IServiceRequestDocument>> {
    const {
      page = '1',
      limit = '10',
      status,
      priority,
      search,
      assignedTo,
      createdBy,
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: FilterQuery<IServiceRequestDocument> = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (createdBy) filter.createdBy = createdBy;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      ServiceRequest.find(filter)
        .populate('createdBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ServiceRequest.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async create(data: CreateServiceRequestData): Promise<IServiceRequestDocument> {
    const request = new ServiceRequest(data);
    const saved = await request.save();
    return this.findById(saved._id.toString()) as Promise<IServiceRequestDocument>;
  }

  async update(
    id: string,
    data: UpdateServiceRequestData
  ): Promise<IServiceRequestDocument | null> {
    return ServiceRequest.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');
  }

  async delete(id: string): Promise<IServiceRequestDocument | null> {
    return ServiceRequest.findByIdAndDelete(id);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const results = await ServiceRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return results.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}

export const serviceRequestRepository = new ServiceRequestRepository();
