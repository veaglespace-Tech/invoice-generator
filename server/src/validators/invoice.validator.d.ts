import { z } from 'zod';
export declare const createInvoiceItemSchema: z.ZodObject<{
    product_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    rate: z.ZodNumber;
    discount: z.ZodDefault<z.ZodNumber>;
    tax_rate: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const createInvoiceSchema: z.ZodObject<{
    customer_id: z.ZodString;
    invoice_date: z.ZodString;
    due_date: z.ZodString;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    terms: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    payment_details: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    items: z.ZodArray<z.ZodObject<{
        product_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        rate: z.ZodNumber;
        discount: z.ZodDefault<z.ZodNumber>;
        tax_rate: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateInvoiceStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        CANCELLED: "CANCELLED";
        DRAFT: "DRAFT";
        GENERATED: "GENERATED";
        OVERDUE: "OVERDUE";
        PAID: "PAID";
        PARTIALLY_PAID: "PARTIALLY_PAID";
        SENT: "SENT";
        VIEWED: "VIEWED";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=invoice.validator.d.ts.map