"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrgStatusSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    adminName: zod_1.z.string().min(2, 'Admin user name is required'),
    adminPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters long')
});
exports.updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    legal_name: zod_1.z.string().optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    city: zod_1.z.string().optional().nullable(),
    state: zod_1.z.string().optional().nullable(),
    country: zod_1.z.string().optional().nullable(),
    pincode: zod_1.z.string().optional().nullable(),
    GSTIN: zod_1.z.string().optional().nullable(),
    PAN: zod_1.z.string().optional().nullable(),
    logo: zod_1.z.string().optional().nullable(),
    website: zod_1.z.string().optional().nullable(),
    currency: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    plan: zod_1.z.enum(['FREE', 'BASIC', 'PRO']).optional(),
    settings: zod_1.z.object({
        supplier_state_code: zod_1.z.string().optional().nullable(),
        transaction_type: zod_1.z.string().optional().nullable(),
        merchant_id: zod_1.z.string().optional().nullable(),
        hsn_code: zod_1.z.string().optional().nullable(),
        signature_name: zod_1.z.string().optional().nullable(),
        signature_location: zod_1.z.string().optional().nullable(),
        terms_conditions: zod_1.z.string().optional().nullable(),
    }).optional().nullable()
});
exports.updateOrgStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED'])
});
//# sourceMappingURL=organization.validator.js.map