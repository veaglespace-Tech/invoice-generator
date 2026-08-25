"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    role: zod_1.z.nativeEnum(client_1.Role),
    organization_id: zod_1.z.string().uuid('Invalid organization ID').optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional()
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    role: zod_1.z.nativeEnum(client_1.Role).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    avatar: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional()
});
//# sourceMappingURL=user.validator.js.map