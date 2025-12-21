import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../config/logger';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const defaultMessage = 'Internal Server Error';
  if (err instanceof AppError) {
    logger.warn({ err }, 'Handled application error');
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({ error: { code: 'INTERNAL', message: defaultMessage } });
}
