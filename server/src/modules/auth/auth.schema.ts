import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    role: z.string(),
    restaurantId: z.number(),
  }),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshInput = z.infer<typeof RefreshSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
