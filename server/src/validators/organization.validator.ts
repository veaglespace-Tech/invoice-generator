import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email format'),
  adminName: z.string().min(2, 'Admin user name is required'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters long')
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  legal_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  GSTIN: z.string().optional().nullable(),
  PAN: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  plan: z.enum(['FREE', 'BASIC', 'PRO']).optional(),
  settings: z.object({
    supplier_state_code: z.string().optional().nullable(),
    transaction_type: z.string().optional().nullable(),
    merchant_id: z.string().optional().nullable(),
    hsn_code: z.string().optional().nullable(),
    signature_name: z.string().optional().nullable(),
    signature_location: z.string().optional().nullable(),
    terms_conditions: z.string().optional().nullable(),
  }).optional().nullable()
});

export const updateOrgStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED'])
});
