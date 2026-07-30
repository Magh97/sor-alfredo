import { z } from 'zod';

export const CreateOrderItemSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().min(1).default(1),
  modifierIds: z.array(z.number().int()).default([]),
});

export const CreateOrderSchema = z.object({
  tableId: z.number().int(),
  items: z.array(CreateOrderItemSchema).min(1, 'Al menos un producto requerido'),
});

export const AddItemsSchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type AddItemsInput = z.infer<typeof AddItemsSchema>;
