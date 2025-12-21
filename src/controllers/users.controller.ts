import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await UserService.getById((req as any).user.id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
