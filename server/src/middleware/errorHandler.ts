import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/environment';

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

const handleMongooseCastError = (error: MongooseError.CastError): AppError =>
  new AppError(`Invalid ${error.path}: ${error.value}`, 400);

const handleMongooseDuplicateKey = (error: MongoError): AppError => {
  const field = Object.keys(error.keyPattern ?? {})[0] ?? 'field';
  return new AppError(`Duplicate value for ${field}. Please use a different value.`, 409);
};

const handleMongooseValidationError = (error: MongooseError.ValidationError): AppError => {
  const messages = Object.values(error.errors).map((err) => err.message);
  return new AppError(`Validation error: ${messages.join('. ')}`, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Token has expired. Please log in again.', 401);

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof MongooseError.CastError) {
    appError = handleMongooseCastError(error);
  } else if ((error as MongoError).code === 11000) {
    appError = handleMongooseDuplicateKey(error as MongoError);
  } else if (error instanceof MongooseError.ValidationError) {
    appError = handleMongooseValidationError(error);
  } else if (error.name === 'JsonWebTokenError') {
    appError = handleJWTError();
  } else if (error.name === 'TokenExpiredError') {
    appError = handleJWTExpiredError();
  } else {
    appError = new AppError('Internal server error', 500, false);
  }

  if (!appError.isOperational) {
    logger.error('UNHANDLED ERROR:', error);
  }

  const responseBody: Record<string, unknown> = {
    success: false,
    error: appError.message,
    statusCode: appError.statusCode,
  };

  if (config.nodeEnv === 'development') {
    responseBody.stack = error.stack;
  }

  res.status(appError.statusCode).json(responseBody);
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
