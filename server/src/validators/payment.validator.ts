import { z } from 'zod';

export const createPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  payment_method: z.string().min(1, 'Payment method is required'),
  transaction_reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});
