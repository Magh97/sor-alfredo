import { z } from 'zod';

export const OpenRegisterSchema = z.object({
  initialAmount: z.string().default('0'),
});

export const PaymentSchema = z.object({
  amount: z.string().min(1, 'Monto requerido'),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  tipAmount: z.string().default('0'),
  tipDistribution: z.enum(['equal', 'individual']).default('equal'),
});

export type OpenRegisterInput = z.infer<typeof OpenRegisterSchema>;
export type PaymentInput = z.infer<typeof PaymentSchema>;
