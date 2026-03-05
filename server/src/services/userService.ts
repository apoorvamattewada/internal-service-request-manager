import { userRepository } from '../repositories/userRepository';
import { IUserDocument } from '../models/User';
import { UserRole } from '../types';
import { NotFoundError } from '../utils/errors';

export class UserService {
  async getAll(): Promise<IUserDocument[]> {
    return userRepository.findAll();
  }

  async getById(id: string): Promise<IUserDocument> {
    if (!userRepository.isValidObjectId(id)) {
      throw new NotFoundError('User');
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async getByRole(role: UserRole): Promise<IUserDocument[]> {
    return userRepository.findByRole(role);
  }

  async update(
    id: string,
    data: Partial<{ name: string; email: string; role: UserRole }>
  ): Promise<IUserDocument> {
    if (!userRepository.isValidObjectId(id)) {
      throw new NotFoundError('User');
    }

    const updated = await userRepository.update(id, data);
    if (!updated) {
      throw new NotFoundError('User');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!userRepository.isValidObjectId(id)) {
      throw new NotFoundError('User');
    }

    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('User');
    }
  }
}

export const userService = new UserService();
