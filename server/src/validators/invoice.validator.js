'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updateInvoiceStatusSchema =
  exports.updateInvoiceSchema =
  exports.createInvoiceSchema =
  exports.createInvoiceItemSchema =
    void 0;
var _zod = require('zod');
const createInvoiceItemSchema = (exports.createInvoiceItemSchema =
  _zod.z.object({
    product_id: _zod.z.string().uuid().optional().nullable(),
    description: _zod.z.string().min(1, 'Description is required'),
    quantity: _zod.z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
    unit: _zod.z.string().optional().nullable(),
    rate: _zod.z.coerce.number().min(0, 'Rate must be positive'),
    discount: _zod.z.coerce.number().min(0).default(0),
    tax_rate: _zod.z.coerce.number().min(0).max(100).default(0)
  }));
const customerInputSchema = _zod.z.object({
  customer_name: _zod.z.string().min(1, 'Customer name is required'),
  company_name: _zod.z.string().optional().nullable(),
  email: _zod.z
    .string()
    .email('Invalid email')
    .optional()
    .nullable()
    .or(_zod.z.literal('')),
  phone: _zod.z.string().optional().nullable(),
  billing_address: _zod.z.string().optional().nullable(),
  shipping_address: _zod.z.string().optional().nullable(),
  city: _zod.z.string().optional().nullable(),
  state: _zod.z.string().optional().nullable(),
  country: _zod.z.string().optional().nullable(),
  pincode: _zod.z.string().optional().nullable(),
  GSTIN: _zod.z.string().optional().nullable(),
  PAN: _zod.z.string().optional().nullable(),
  notes: _zod.z.string().optional().nullable()
});

const createInvoiceSchema = (exports.createInvoiceSchema = _zod.z.object({
  customer_id: _zod.z.string().uuid('Invalid customer ID').optional().nullable(),
  customer: customerInputSchema.optional().nullable(),
  invoice_number: _zod.z.string().optional().nullable(),
  type: _zod.z.enum(['SALES', 'PURCHASE', 'EXPENSE']).optional().nullable().default('SALES'),
  invoice_date: _zod.z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
  due_date: _zod.z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
  notes: _zod.z.string().optional().nullable(),
  terms: _zod.z.string().optional().nullable(),
  payment_details: _zod.z.string().optional().nullable(),
  document_ref_no: _zod.z.string().optional().nullable(),
  document_date: _zod.z.string().optional().nullable(),
  category: _zod.z.string().optional().nullable(),
  document_type_code: _zod.z.string().optional().nullable(),
  irn: _zod.z.string().optional().nullable(),
  tax_type: _zod.z
    .enum(['AUTO', 'IGST', 'CGST_SGST'])
    .optional()
    .nullable()
    .default('AUTO'),
  status: _zod.z.enum([
      'DRAFT',
      'GENERATED',
      'SENT',
      'VIEWED',
      'PAID',
      'PARTIALLY_PAID',
      'OVERDUE',
      'CANCELLED'
    ]).optional().nullable(),
  items: _zod.z
    .array(createInvoiceItemSchema)
    .min(1, 'At least one item is required')
}).refine((data) => data.customer_id || (data.customer && data.customer.customer_name), {
  message: 'Customer is required (select existing customer or enter customer name)',
  path: ['customer_id']
}));
const updateInvoiceSchema = (exports.updateInvoiceSchema = createInvoiceSchema);
const updateInvoiceStatusSchema = (exports.updateInvoiceStatusSchema =
  _zod.z.object({
    status: _zod.z.enum([
      'DRAFT',
      'GENERATED',
      'SENT',
      'VIEWED',
      'PAID',
      'PARTIALLY_PAID',
      'OVERDUE',
      'CANCELLED'
    ])
  }));
