import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Env } from '../config/env';
import { AppError } from '../errors/app-error';

export interface AuthUserPayload {
  id: string;
  email: string;
  jti?: string;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  // Attente d'un header Authorization de type "Bearer <token>"
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
  const token = header.substring('Bearer '.length);
  try {
    const payload = jwt.verify(token, Env.ACCESS_TOKEN_SECRET) as AuthUserPayload & {
      iat: number;
      exp: number;
    };
    // Injection de l'utilisateur décodé dans la requête pour les handlers
    (req as any).user = { id: payload.id, email: payload.email };
    return next();
  } catch (_error) {
    // Jeton invalide ou expiré -> refus
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
}
