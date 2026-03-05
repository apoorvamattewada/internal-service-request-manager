import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { userRepository } from '../repositories/userRepository';
import { IUserDocument } from '../models/User';
import { UserRole, JwtPayload } from '../types';
import { ConflictError, UnauthorizedError } from '../utils/errors';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResult {
  user: IUserDocument;
  token: string;
}

export class AuthService {
  private generateToken(user: IUserDocument): string {
    const payload: JwtPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  async register(data: RegisterPayload): Promise<AuthResult> {
    const exists = await userRepository.exists({ email: data.email });
    if (exists) {
      throw new ConflictError('An account with this email already exists');
    }

    const user = await userRepository.create(data);
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(data: LoginPayload): Promise<AuthResult> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return userRepository.findById(id);
  }
}

export const authService = new AuthService();
