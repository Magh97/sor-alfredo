import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { AppError } from '../../shared/errors.js';
import type { LoginInput } from './auth.schema.js';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const REFRESH_TOKENS = new Map<string, { userId: number; role: string; restaurantId: number }>();

export class AuthService {
  static async login(input: LoginInput) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, input.email),
    });

    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Credenciales inválidas', 401);
    }

    if (!user.isActive) {
      throw new AppError('UNAUTHORIZED', 'Usuario desactivado', 401);
    }

    const valid = await bcryptjs.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError('UNAUTHORIZED', 'Credenciales inválidas', 401);
    }

    const payload = { userId: user.id, role: user.role, restaurantId: user.restaurantId };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    REFRESH_TOKENS.set(refreshToken, payload);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    };
  }

  static refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number; role: string; restaurantId: number };

      if (!REFRESH_TOKENS.has(refreshToken)) {
        throw new AppError('UNAUTHORIZED', 'Refresh token revocado', 401);
      }

      const newToken = jwt.sign(
        { userId: payload.userId, role: payload.role, restaurantId: payload.restaurantId },
        JWT_SECRET,
        { expiresIn: '8h' },
      );

      return { token: newToken };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('UNAUTHORIZED', 'Refresh token inválido o expirado', 401);
    }
  }
}
