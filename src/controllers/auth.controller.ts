import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AppError } from '../errors/app-error';

// Contrôleurs d'authentification
// Les handlers exposent des réponses JSON standardisées et délèguent
// la logique métier aux services (UserService, AuthService).
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await UserService.register(email, password);
    const { accessToken, refreshToken } = await AuthService.issueTokens(user.id, user.email);
    AuthService.setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, token: accessToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await UserService.validateCredentials(email, password);
    const { accessToken, refreshToken } = await AuthService.issueTokens(user.id, user.email);
    AuthService.setRefreshCookie(res, refreshToken);
    res.status(200).json({ user, token: accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const cookie = req.cookies?.['refresh_token'];
    // Si aucun cookie de refresh n'est présent, on refuse l'accès.
    if (!cookie) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const { accessToken, newRefreshToken, user } = await AuthService.refreshFromToken(cookie);
    AuthService.setRefreshCookie(res, newRefreshToken);
    res.status(200).json({ user, token: accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction) {
  try {
    // Révocation du refresh token côté serveur si présent,
    // puis suppression du cookie côté client.
    const cookie = (_req as any).cookies?.['refresh_token'] || _req.cookies?.['refresh_token'];
    if (cookie) await AuthService.revokeRefreshToken(cookie);
    AuthService.clearRefreshCookie(res);
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
