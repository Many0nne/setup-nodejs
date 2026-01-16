import crypto from 'crypto';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { Env } from '../config/env';
import { Response } from 'express';
import { AppError } from '../errors/app-error';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserService } from './user.service';

// Service d'authentification
// - Les access tokens sont des JWTs signés (courte durée)
// - Les refresh tokens sont des tokens opaques stockés hachés en base
//   (meilleure pratique : ne jamais stocker les tokens opaques en clair)

// Crée un JWT pour l'accès (inclut un `jti` pour traçabilité).
function signAccessToken(id: string, email: string) {
  const secret = Env.ACCESS_TOKEN_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: Env.ACCESS_TOKEN_EXPIRES as unknown as SignOptions['expiresIn'],
  };

  const payload = {
    id,
    email,
    jti: crypto.randomUUID(),
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, secret, options);
}

// Génère un token opaque aléatoire utilisé comme refresh token.
function generateOpaqueRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

// Hache le token opaque avant stockage en base (SHA-256).
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
    // Retourne l'access token (JWT) et le refresh token opaque (pour cookie)
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
      // Token non trouvé, expiré ou déjà révoqué -> refus
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }
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
