import apiClient from './client';
import {
  ApiResponse,
  ServiceRequest,
  PaginatedResponse,
  ServiceRequestFilters,
  CreateServiceRequestPayload,
  UpdateServiceRequestPayload,
} from '../types';

export const serviceRequestApi = {
  getAll: async (
    filters: ServiceRequestFilters = {}
  ): Promise<PaginatedResponse<ServiceRequest>> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ServiceRequest>>>(
      `/requests?${params.toString()}`
    );
    if (!data.data) throw new Error('Invalid response');
    return data.data;
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const { data } = await apiClient.get<ApiResponse<ServiceRequest>>(`/requests/${id}`);
    if (!data.data) throw new Error('Invalid response');
    return data.data;
  },

  create: async (payload: CreateServiceRequestPayload): Promise<ServiceRequest> => {
    const { data } = await apiClient.post<ApiResponse<ServiceRequest>>('/requests', payload);
    if (!data.data) throw new Error('Invalid response');
    return data.data;
  },

  update: async (id: string, payload: UpdateServiceRequestPayload): Promise<ServiceRequest> => {
    const { data } = await apiClient.patch<ApiResponse<ServiceRequest>>(
      `/requests/${id}`,
      payload
    );
    if (!data.data) throw new Error('Invalid response');
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/requests/${id}`);
  },

  getStats: async (): Promise<Record<string, number>> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, number>>>('/requests/stats');
    if (!data.data) throw new Error('Invalid response');
    return data.data;
  },
};
