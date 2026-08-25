"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    invoice_id: zod_1.z.string().uuid(),
    amount: zod_1.z.number().min(0.01, 'Amount must be greater than 0'),
    payment_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    payment_method: zod_1.z.string().min(1, 'Payment method is required'),
    transaction_reference: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable()
});
//# sourceMappingURL=payment.validator.js.map