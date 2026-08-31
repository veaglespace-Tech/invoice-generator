'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.registerOrgSchema =
  exports.refreshTokenSchema =
  exports.loginSchema =
    void 0;
var _zod = require('zod');
const loginSchema = (exports.loginSchema = _zod.z.object({
  email: _zod.z.string().email('Invalid email format').trim().toLowerCase(),
  password: _zod.z
    .string()
    .min(6, 'Password must be at least 6 characters long')
}));
const registerOrgSchema = (exports.registerOrgSchema = _zod.z.object({
  orgName: _zod.z.string().min(2, 'Organization name is required'),
  userName: _zod.z.string().min(2, 'User name is required'),
  email: _zod.z.string().email('Invalid email format').trim().toLowerCase(),
  password: _zod.z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  // Additional organization details
  legalName: _zod.z.string().optional(),
  orgPhone: _zod.z.string().optional(),
  address: _zod.z.string().optional(),
  city: _zod.z.string().optional(),
  state: _zod.z.string().optional(),
  country: _zod.z.string().optional(),
  pincode: _zod.z.string().optional(),
  GSTIN: _zod.z.string().optional(),
  PAN: _zod.z.string().optional(),
  plan_id: _zod.z.string().optional()
}));
const refreshTokenSchema = (exports.refreshTokenSchema = _zod.z.object({
  refreshToken: _zod.z.string().min(1, 'Refresh token is required')
}));
