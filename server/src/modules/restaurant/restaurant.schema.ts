import { z } from 'zod';

export const UpdateRestaurantSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});
