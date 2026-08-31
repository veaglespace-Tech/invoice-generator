'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createPaymentSchema = void 0;
var _zod = require('zod');
const createPaymentSchema = (exports.createPaymentSchema = _zod.z.object({
  invoice_id: _zod.z.string().uuid(),
  amount: _zod.z.number().min(0.01, 'Amount must be greater than 0'),
  payment_date: _zod.z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  payment_method: _zod.z.string().min(1, 'Payment method is required'),
  transaction_reference: _zod.z.string().optional().nullable(),
  notes: _zod.z.string().optional().nullable()
}));
