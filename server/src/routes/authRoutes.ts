import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import {
  registerValidation,
  loginValidation,
  validate,
} from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, validate, (req, res, next) => {
  void authController.register(req, res, next);
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post('/login', loginValidation, validate, (req, res, next) => {
  void authController.login(req, res, next);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get('/me', authenticate, (req, res, next) => {
  void authController.me(req, res, next);
});

export default router;
