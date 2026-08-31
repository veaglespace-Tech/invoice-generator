'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updateProductSchema = exports.createProductSchema = void 0;
var _zod = require('zod');
var _client = require('@prisma/client');
const createProductSchema = (exports.createProductSchema = _zod.z.object({
  name: _zod.z.string().min(2, 'Name is required'),
  description: _zod.z.string().optional().nullable(),
  SKU: _zod.z.string().optional().nullable(),
  type: _zod.z.nativeEnum(_client.ProductType),
  unit: _zod.z.string().optional().nullable(),
  price: _zod.z.number().min(0, 'Price must be positive'),
  tax_rate: _zod.z
    .number()
    .min(0)
    .max(100, 'Tax rate must be between 0 and 100')
    .optional()
    .default(0)
}));
const updateProductSchema = (exports.updateProductSchema = createProductSchema
  .partial()
  .extend({
    status: _zod.z.enum(['ACTIVE', 'INACTIVE']).optional()
  }));
