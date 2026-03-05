import apiClient from './client';
import { ApiResponse, User } from '../types';

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
    if (!data.data) throw new Error('Invalid response');
    return data.data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    if (!data.data) throw new Error('Invalid response');
    return data.data;
  },

  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload);
    if (!data.data) throw new Error('Invalid response');
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
