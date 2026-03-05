import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): Response =>
  sendSuccess(res, data, message, 201);

export const sendNoContent = (res: Response): Response => res.status(204).send();

export const sendError = (res: Response, message: string, statusCode = 500): Response => {
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  return res.status(statusCode).json(response);
};
