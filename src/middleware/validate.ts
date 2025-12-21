import { ZodTypeAny, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

export function validate(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new AppError(err.issues.map((e) => e.message).join(', '), 400, 'VALIDATION_ERROR')
        );
      }
      return next(err);
    }
  };
}
