'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updateUserSchema =
  exports.createUserSchema =
  exports.changePasswordSchema =
    void 0;
var _zod = require('zod');
var _client = require('@prisma/client');
const createUserSchema = (exports.createUserSchema = _zod.z.object({
  name: _zod.z.string().min(2, 'Name is required'),
  email: _zod.z.string().email('Invalid email format'),
  password: _zod.z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  role: _zod.z.nativeEnum(_client.Role),
  organization_id: _zod.z.string().uuid('Invalid organization ID').optional(),
  permissions: _zod.z.array(_zod.z.string()).optional()
}));
const updateUserSchema = (exports.updateUserSchema = _zod.z.object({
  name: _zod.z.string().min(2).optional(),
  email: _zod.z.string().email('Invalid email format').optional(),
  role: _zod.z.nativeEnum(_client.Role).optional(),
  status: _zod.z.enum(['ACTIVE', 'INACTIVE']).optional(),
  avatar: _zod.z.string().optional(),
  permissions: _zod.z.array(_zod.z.string()).optional()
}));
const changePasswordSchema = (exports.changePasswordSchema = _zod.z.object({
  currentPassword: _zod.z.string().min(1, 'Current password is required'),
  newPassword: _zod.z
    .string()
    .min(6, 'New password must be at least 6 characters long')
}));
