import { FilterQuery, Types } from 'mongoose';
import { User, IUserDocument } from '../models/User';
import { UserRole } from '../types';

export class UserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email }).select('+password');
  }

  async findAll(): Promise<IUserDocument[]> {
    return User.find().sort({ createdAt: -1 });
  }

  async findByRole(role: UserRole): Promise<IUserDocument[]> {
    return User.find({ role });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<IUserDocument> {
    const user = new User(data);
    return user.save();
  }

  async update(
    id: string,
    data: Partial<{ name: string; email: string; role: UserRole }>
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IUserDocument | null> {
    return User.findByIdAndDelete(id);
  }

  async exists(filter: FilterQuery<IUserDocument>): Promise<boolean> {
    const count = await User.countDocuments(filter);
    return count > 0;
  }

  async count(): Promise<number> {
    return User.countDocuments();
  }

  isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}

export const userRepository = new UserRepository();
