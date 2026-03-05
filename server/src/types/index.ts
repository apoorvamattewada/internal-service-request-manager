import { Request } from 'express';
import { Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum Status {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  CLOSED = 'Closed',
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceRequest {
  _id: Types.ObjectId;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdBy: Types.ObjectId | IUser;
  assignedTo?: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ServiceRequestQuery extends PaginationQuery {
  status?: Status;
  priority?: Priority;
  search?: string;
  assignedTo?: string;
  createdBy?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
