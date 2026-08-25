import { z } from 'zod';
import { ProductType } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional().nullable(),
  SKU: z.string().optional().nullable(),
  type: z.nativeEnum(ProductType),
  unit: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be positive'),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional().default(0)
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});
