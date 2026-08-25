"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceStatusSchema = exports.createInvoiceSchema = exports.createInvoiceItemSchema = void 0;
const zod_1 = require("zod");
exports.createInvoiceItemSchema = zod_1.z.object({
    product_id: zod_1.z.string().uuid().optional().nullable(),
    description: zod_1.z.string().min(1, 'Description is required'),
    quantity: zod_1.z.number().min(0.01, 'Quantity must be greater than 0'),
    unit: zod_1.z.string().optional().nullable(),
    rate: zod_1.z.number().min(0, 'Rate must be positive'),
    discount: zod_1.z.number().min(0).default(0),
    tax_rate: zod_1.z.number().min(0).max(100).default(0)
});
exports.createInvoiceSchema = zod_1.z.object({
    customer_id: zod_1.z.string().uuid('Invalid customer ID'),
    invoice_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    due_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    notes: zod_1.z.string().optional().nullable(),
    terms: zod_1.z.string().optional().nullable(),
    payment_details: zod_1.z.string().optional().nullable(),
    items: zod_1.z.array(exports.createInvoiceItemSchema).min(1, 'At least one item is required')
});
exports.updateInvoiceStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'DRAFT', 'GENERATED', 'SENT', 'VIEWED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'
    ])
});
//# sourceMappingURL=invoice.validator.js.map