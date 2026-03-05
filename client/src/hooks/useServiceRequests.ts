import { useState, useCallback } from 'react';
import { serviceRequestApi } from '../api/serviceRequestApi';
import {
  ServiceRequest,
  PaginatedResponse,
  ServiceRequestFilters,
  CreateServiceRequestPayload,
  UpdateServiceRequestPayload,
} from '../types';

interface UseServiceRequestsReturn {
  requests: PaginatedResponse<ServiceRequest> | null;
  currentRequest: ServiceRequest | null;
  isLoading: boolean;
  error: string | null;
  fetchAll: (filters?: ServiceRequestFilters) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  create: (payload: CreateServiceRequestPayload) => Promise<ServiceRequest>;
  update: (id: string, payload: UpdateServiceRequestPayload) => Promise<ServiceRequest>;
  remove: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useServiceRequests = (): UseServiceRequestsReturn => {
  const [requests, setRequests] = useState<PaginatedResponse<ServiceRequest> | null>(null);
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): void => {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const fetchAll = useCallback(async (filters?: ServiceRequestFilters): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await serviceRequestApi.getAll(filters);
      setRequests(result);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await serviceRequestApi.getById(id);
      setCurrentRequest(result);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(
    async (payload: CreateServiceRequestPayload): Promise<ServiceRequest> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await serviceRequestApi.create(payload);
        return result;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const update = useCallback(
    async (id: string, payload: UpdateServiceRequestPayload): Promise<ServiceRequest> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await serviceRequestApi.update(id, payload);
        setCurrentRequest(result);
        return result;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await serviceRequestApi.delete(id);
      setRequests((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.filter((r) => r._id !== id),
              pagination: { ...prev.pagination, total: prev.pagination.total - 1 },
            }
          : null
      );
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback((): void => setError(null), []);

  return {
    requests,
    currentRequest,
    isLoading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    clearError,
  };
};
