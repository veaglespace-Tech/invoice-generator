"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.registerOrgSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long')
});
exports.registerOrgSchema = zod_1.z.object({
    orgName: zod_1.z.string().min(2, 'Organization name is required'),
    userName: zod_1.z.string().min(2, 'User name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    // Additional organization details
    legalName: zod_1.z.string().optional(),
    orgPhone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    GSTIN: zod_1.z.string().optional(),
    PAN: zod_1.z.string().optional()
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
//# sourceMappingURL=auth.validator.js.map