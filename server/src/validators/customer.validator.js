'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
var _zod = require('zod');
const createCustomerSchema = (exports.createCustomerSchema = _zod.z.object({
  customer_name: _zod.z.string().min(2, 'Customer name is required'),
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
}));
const updateCustomerSchema = (exports.updateCustomerSchema =
  createCustomerSchema.partial().extend({
    status: _zod.z.enum(['ACTIVE', 'INACTIVE']).optional()
  }));
