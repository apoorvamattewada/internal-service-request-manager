import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { UserRole } from '../types';

// Mock the repository
jest.mock('../repositories/userRepository');
jest.mock('../config/environment', () => ({
  config: {
    nodeEnv: 'test',
    jwtSecret: 'test-secret-key-for-unit-tests-only',
    jwtExpiresIn: '1h',
  },
}));

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictError if email already exists', async () => {
      mockUserRepository.exists.mockResolvedValue(true);

      await expect(
        authService.register({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'Password1!',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should create a new user and return token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'new@example.com',
        role: UserRole.EMPLOYEE,
        toString: () => 'user123',
      };

      mockUserRepository.exists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(mockUser as never);

      const result = await authService.register({
        name: 'Test User',
        email: 'new@example.com',
        password: 'Password1!',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedError if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@example.com', password: 'Password1!' })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
        comparePassword: jest.fn().mockResolvedValue(false),
        toString: () => 'user123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as never);

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPassword1!' })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should return user and token on successful login', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
        comparePassword: jest.fn().mockResolvedValue(true),
        toString: () => 'user123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as never);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should throw UnauthorizedError for invalid token', () => {
      expect(() => authService.verifyToken('invalid.token.here')).toThrow(UnauthorizedError);
    });
  });
});
