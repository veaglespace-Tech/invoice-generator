'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updateOrganizationSchema =
  exports.updateOrgStatusSchema =
  exports.createOrganizationSchema =
    void 0;
var _zod = require('zod');
const createOrganizationSchema = (exports.createOrganizationSchema =
  _zod.z.object({
    name: _zod.z.string().min(2, 'Name is required'),
    email: _zod.z.string().email('Invalid email format'),
    adminName: _zod.z.string().min(2, 'Admin user name is required'),
    adminPassword: _zod.z
      .string()
      .min(6, 'Password must be at least 6 characters long')
  }));
const updateOrganizationSchema = (exports.updateOrganizationSchema =
  _zod.z.object({
    name: _zod.z.string().min(2).optional(),
    legal_name: _zod.z.string().optional().nullable(),
    email: _zod.z.string().email('Invalid email format').optional(),
    phone: _zod.z.string().optional().nullable(),
    fax: _zod.z.string().optional().nullable(),
    address: _zod.z.string().optional().nullable(),
    city: _zod.z.string().optional().nullable(),
    state: _zod.z.string().optional().nullable(),
    country: _zod.z.string().optional().nullable(),
    pincode: _zod.z.string().optional().nullable(),
    GSTIN: _zod.z.string().optional().nullable(),
    PAN: _zod.z.string().optional().nullable(),
    logo: _zod.z.string().optional().nullable(),
    website: _zod.z.string().optional().nullable(),
    currency: _zod.z.string().optional(),
    timezone: _zod.z.string().optional(),
    plan_id: _zod.z.string().uuid('Invalid Plan ID').optional(),
    settings: _zod.z
      .object({
        supplier_state_code: _zod.z.string().optional().nullable(),
        transaction_type: _zod.z.string().optional().nullable(),
        merchant_id: _zod.z.string().optional().nullable(),
        hsn_code: _zod.z.string().optional().nullable(),
        signature_name: _zod.z.string().optional().nullable(),
        signature_location: _zod.z.string().optional().nullable(),
        terms_conditions: _zod.z.string().optional().nullable(),
        field_visibility: _zod.z.any().optional().nullable()
      })
      .optional()
      .nullable()
  }));
const updateOrgStatusSchema = (exports.updateOrgStatusSchema = _zod.z.object({
  status: _zod.z.enum(['ACTIVE', 'SUSPENDED'])
}));
