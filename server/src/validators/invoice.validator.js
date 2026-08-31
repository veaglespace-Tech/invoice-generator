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
    quantity: _zod.z.number().min(0.01, 'Quantity must be greater than 0'),
    unit: _zod.z.string().optional().nullable(),
    rate: _zod.z.number().min(0, 'Rate must be positive'),
    discount: _zod.z.number().min(0).default(0),
    tax_rate: _zod.z.number().min(0).max(100).default(0)
  }));
const createInvoiceSchema = (exports.createInvoiceSchema = _zod.z.object({
  customer_id: _zod.z.string().uuid('Invalid customer ID'),
  invoice_number: _zod.z.string().optional().nullable(),
  invoice_date: _zod.z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  due_date: _zod.z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  notes: _zod.z.string().optional().nullable(),
  terms: _zod.z.string().optional().nullable(),
  payment_details: _zod.z.string().optional().nullable(),
  document_ref_no: _zod.z.string().optional().nullable(),
  document_date: _zod.z.string().optional().nullable(),
  category: _zod.z.string().optional().nullable(),
  document_type_code: _zod.z.string().optional().nullable(),
  irn: _zod.z.string().optional().nullable(),
  items: _zod.z
    .array(createInvoiceItemSchema)
    .min(1, 'At least one item is required')
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
