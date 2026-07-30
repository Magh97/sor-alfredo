import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors.js';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          reason: e.message,
        }));
        throw new AppError('VALIDATION_ERROR', 'Campos inválidos', 400, details);
      }
      next(error);
    }
  };
}
