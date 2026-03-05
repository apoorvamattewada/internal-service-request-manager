import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', authorize(UserRole.ADMIN), (req, res, next) => {
  void userController.getAll(req, res, next);
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private/Admin
 */
router.get('/:id', authorize(UserRole.ADMIN), (req, res, next) => {
  void userController.getById(req, res, next);
});

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user (admin only)
 * @access  Private/Admin
 */
router.patch('/:id', authorize(UserRole.ADMIN), (req, res, next) => {
  void userController.update(req, res, next);
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authorize(UserRole.ADMIN), (req, res, next) => {
  void userController.delete(req, res, next);
});

export default router;
