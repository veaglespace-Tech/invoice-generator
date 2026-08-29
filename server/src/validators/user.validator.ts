import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(Role),
  organization_id: z.string().uuid('Invalid organization ID').optional(),
  permissions: z.array(z.string()).optional()
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  avatar: z.string().optional(),
  permissions: z.array(z.string()).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});
