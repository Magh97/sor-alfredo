import { z } from 'zod';

export const CreateTableSchema = z.object({
  number: z.number().int().min(1),
  name: z.string().optional(),
  capacity: z.number().int().min(1).default(4),
  positionX: z.number().int().default(0),
  positionY: z.number().int().default(0),
});

export const UpdateTableSchema = z.object({
  number: z.number().int().min(1).optional(),
  name: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
});

export const ChangeStatusSchema = z.object({
  status: z.enum(['free', 'occupied', 'reserved', 'cleaning']),
});

export const TransferTableSchema = z.object({
  targetTableId: z.number().int(),
});

export type CreateTableInput = z.infer<typeof CreateTableSchema>;
export type UpdateTableInput = z.infer<typeof UpdateTableSchema>;
