import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const CreateProductSchema = z.object({
  categoryId: z.number().int().nullable().optional(),
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional().nullable(),
  basePrice: z.string().min(1, 'Precio requerido'),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  modifierIds: z.array(z.number().int()).default([]),
});

export const UpdateProductSchema = z.object({
  categoryId: z.number().int().nullable().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  basePrice: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  modifierIds: z.array(z.number().int()).optional(),
});

export const CreateModifierSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  priceAdjustment: z.string().default('0'),
  isAvailable: z.boolean().default(true),
});

export const UpdateModifierSchema = z.object({
  name: z.string().min(1).optional(),
  priceAdjustment: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateModifierInput = z.infer<typeof CreateModifierSchema>;
export type UpdateModifierInput = z.infer<typeof UpdateModifierSchema>;
