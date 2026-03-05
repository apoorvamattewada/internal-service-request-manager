import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { Priority, Status, UserRole } from '../types';

export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg as string);
    const error = new Error(messages.join('. '));
    error.name = 'ValidationError';
    Object.assign(error, { statusCode: 400, isOperational: true });
    return next(error);
  }
  next();
};

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(Object.values(UserRole)).withMessage(`Role must be one of: ${Object.values(UserRole).join(', ')}`),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const createServiceRequestValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(Object.values(Priority)).withMessage(`Priority must be one of: ${Object.values(Priority).join(', ')}`),
  body('assignedTo')
    .optional()
    .isMongoId().withMessage('assignedTo must be a valid user ID'),
];

export const updateServiceRequestValidation = [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('priority')
    .optional()
    .isIn(Object.values(Priority)).withMessage(`Priority must be one of: ${Object.values(Priority).join(', ')}`),
  body('status')
    .optional()
    .isIn(Object.values(Status)).withMessage(`Status must be one of: ${Object.values(Status).join(', ')}`),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId().withMessage('assignedTo must be a valid user ID'),
];

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(Object.values(Status)).withMessage('Invalid status filter'),
  query('priority').optional().isIn(Object.values(Priority)).withMessage('Invalid priority filter'),
];
