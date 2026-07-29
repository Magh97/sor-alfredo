import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors.js';

interface JwtPayload {
  userId: number;
  role: string;
  restaurantId: number;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Token requerido', 401);
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: payload.userId, role: payload.role, restaurantId: payload.restaurantId };
    next();
  } catch {
    throw new AppError('UNAUTHORIZED', 'Token inválido o expirado', 401);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('FORBIDDEN', `Requiere rol: ${roles.join(' | ')}`, 403);
    }
    next();
  };
}
