"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    customer_name: zod_1.z.string().min(2, 'Customer name is required'),
    company_name: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email('Invalid email').optional().nullable().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().nullable(),
    billing_address: zod_1.z.string().optional().nullable(),
    shipping_address: zod_1.z.string().optional().nullable(),
    city: zod_1.z.string().optional().nullable(),
    state: zod_1.z.string().optional().nullable(),
    country: zod_1.z.string().optional().nullable(),
    pincode: zod_1.z.string().optional().nullable(),
    GSTIN: zod_1.z.string().optional().nullable(),
    PAN: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable()
});
exports.updateCustomerSchema = exports.createCustomerSchema.partial().extend({
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional()
});
//# sourceMappingURL=customer.validator.js.map