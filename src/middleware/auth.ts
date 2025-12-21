import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Env } from '../config/env';
import { AppError } from '../errors/app-error';

export interface AuthUserPayload {
  id: string;
  email: string;
  jti?: string; // Optional JWT ID for token uniqueness
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
  const token = header.substring('Bearer '.length);
  try {
    const payload = jwt.verify(token, Env.ACCESS_TOKEN_SECRET) as AuthUserPayload & {
      iat: number;
      exp: number;
    };
    (req as any).user = { id: payload.id, email: payload.email };
    return next();
  } catch (e) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
}
