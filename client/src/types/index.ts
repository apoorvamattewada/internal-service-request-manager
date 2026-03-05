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

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdBy: User;
  assignedTo?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ServiceRequestFilters {
  status?: Status | '';
  priority?: Priority | '';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateServiceRequestPayload {
  title: string;
  description: string;
  priority: Priority;
  assignedTo?: string;
}

export interface UpdateServiceRequestPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  assignedTo?: string | null;
}
