import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['waiter', 'cashier', 'admin', 'superadmin']),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['waiter', 'cashier', 'admin', 'superadmin']).optional(),
  isActive: z.boolean().optional(),
});

export const UserResponseSchema = z.object({
  id: z.number(),
  restaurantId: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
