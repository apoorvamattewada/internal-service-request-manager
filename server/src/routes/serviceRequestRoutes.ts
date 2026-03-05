import { Router } from 'express';
import { serviceRequestController } from '../controllers/serviceRequestController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createServiceRequestValidation,
  updateServiceRequestValidation,
  paginationValidation,
  validate,
} from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/requests/stats
 * @desc    Get service request statistics (admin only)
 * @access  Private/Admin
 */
router.get('/stats', authorize(UserRole.ADMIN), (req, res, next) => {
  void serviceRequestController.getStats(req, res, next);
});

/**
 * @route   GET /api/requests
 * @desc    Get all service requests with filters and pagination
 * @access  Private
 */
router.get('/', paginationValidation, validate, (req, res, next) => {
  void serviceRequestController.getAll(req, res, next);
});

/**
 * @route   GET /api/requests/:id
 * @desc    Get single service request by ID
 * @access  Private
 */
router.get('/:id', (req, res, next) => {
  void serviceRequestController.getById(req, res, next);
});

/**
 * @route   POST /api/requests
 * @desc    Create a new service request
 * @access  Private
 */
router.post('/', createServiceRequestValidation, validate, (req, res, next) => {
  void serviceRequestController.create(req, res, next);
});

/**
 * @route   PATCH /api/requests/:id
 * @desc    Update a service request
 * @access  Private (owner or admin)
 */
router.patch('/:id', updateServiceRequestValidation, validate, (req, res, next) => {
  void serviceRequestController.update(req, res, next);
});

/**
 * @route   DELETE /api/requests/:id
 * @desc    Delete a service request
 * @access  Private (owner or admin)
 */
router.delete('/:id', (req, res, next) => {
  void serviceRequestController.delete(req, res, next);
});

export default router;
