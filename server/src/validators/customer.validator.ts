import { z } from 'zod';

export const createCustomerSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  company_name: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  billing_address: z.string().optional().nullable(),
  shipping_address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  GSTIN: z.string().optional().nullable(),
  PAN: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});
