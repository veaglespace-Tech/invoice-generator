import { z } from 'zod';

export const createInvoiceItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().optional().nullable(),
  rate: z.number().min(0, 'Rate must be positive'),
  discount: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(100).default(0)
});

export const createInvoiceSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  invoice_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  payment_details: z.string().optional().nullable(),
  items: z.array(createInvoiceItemSchema).min(1, 'At least one item is required')
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum([
    'DRAFT', 'GENERATED', 'SENT', 'VIEWED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'
  ])
});
