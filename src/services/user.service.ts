import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../errors/app-error';
import { Env } from '../config/env';

export const UserService = {
  register: async (email: string, password: string) => {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new AppError('Email already in use', 409, 'EMAIL_TAKEN');
    const hash = await bcrypt.hash(password, Env.BCRYPT_SALT_ROUNDS);
    const user = await UserRepository.create(email, hash);
    return sanitize(user);
  },
  validateCredentials: async (email: string, password: string) => {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    return sanitize(user);
  },
  getById: async (id: string) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return sanitize(user);
  },
};

function sanitize<T extends { passwordHash?: string }>(u: T) {
  const { passwordHash: _passwordHash, ...rest } = u as any;
  return rest;
}
