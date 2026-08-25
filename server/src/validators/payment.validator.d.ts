import { z } from 'zod';
export declare const createPaymentSchema: z.ZodObject<{
    invoice_id: z.ZodString;
    amount: z.ZodNumber;
    payment_date: z.ZodString;
    payment_method: z.ZodString;
    transaction_reference: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=payment.validator.d.ts.map