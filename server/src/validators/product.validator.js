"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    description: zod_1.z.string().optional().nullable(),
    SKU: zod_1.z.string().optional().nullable(),
    type: zod_1.z.nativeEnum(client_1.ProductType),
    unit: zod_1.z.string().optional().nullable(),
    price: zod_1.z.number().min(0, 'Price must be positive'),
    tax_rate: zod_1.z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional().default(0)
});
exports.updateProductSchema = exports.createProductSchema.partial().extend({
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional()
});
//# sourceMappingURL=product.validator.js.map