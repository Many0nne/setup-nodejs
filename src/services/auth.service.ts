import crypto from 'crypto';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { Env } from '../config/env';
import { Response } from 'express';
import { AppError } from '../errors/app-error';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserService } from './user.service';

function signAccessToken(id: string, email: string) {
  const secret = Env.ACCESS_TOKEN_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: Env.ACCESS_TOKEN_EXPIRES as unknown as SignOptions['expiresIn'],
  };

  // Add unique elements to ensure token uniqueness
  const payload = {
    id,
    email,
    jti: crypto.randomUUID(), // Unique token ID
    iat: Math.floor(Date.now() / 1000), // Explicit issued-at timestamp
  };

  return jwt.sign(payload, secret, options);
}

function generateOpaqueRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cookieOptions() {
  const secure = Env.COOKIE_SECURE ?? Env.NODE_ENV === 'production';
  return {
    httpOnly: true as const,
    secure,
    sameSite: 'lax' as const,
    domain: Env.COOKIE_DOMAIN,
    path: '/api/auth',
    maxAge:
      typeof Env.REFRESH_TOKEN_EXPIRES === 'string' && Env.REFRESH_TOKEN_EXPIRES.endsWith('d')
        ? parseInt(Env.REFRESH_TOKEN_EXPIRES) * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000,
  };
}

export const AuthService = {
  async issueTokens(id: string, email: string) {
    const accessToken = signAccessToken(id, email);
    const opaque = generateOpaqueRefreshToken();
    const tokenHash = hashToken(opaque);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshTokenRepository.create({ userId: id, tokenHash, expiresAt });
    return { accessToken, refreshToken: opaque };
  },

  setRefreshCookie(res: Response, refreshToken: string) {
    const opts = cookieOptions();
    res.cookie('refresh_token', refreshToken, opts);
  },

  clearRefreshCookie(res: Response) {
    const opts = cookieOptions();
    res.clearCookie('refresh_token', opts);
  },

  async refreshFromToken(opaque: string) {
    const tokenHash = hashToken(opaque);
    const record = await RefreshTokenRepository.findByHash(tokenHash);
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }
    // rotate: revoke current and issue new
    await RefreshTokenRepository.revokeById(record.id);
    const user = await UserService.getById(record.userId);
    const { accessToken, refreshToken: newOpaque } = await AuthService.issueTokens(
      user.id as string,
      user.email
    );
    return { accessToken, newRefreshToken: newOpaque, user };
  },

  async revokeRefreshToken(opaque: string) {
    const tokenHash = hashToken(opaque);
    const record = await RefreshTokenRepository.findByHash(tokenHash);
    if (record) {
      await RefreshTokenRepository.revokeById(record.id);
    }
  },
};
