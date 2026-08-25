import { z } from 'zod';
export declare const createCustomerSchema: z.ZodObject<{
    customer_name: z.ZodString;
    company_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    billing_address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    shipping_address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    city: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    state: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    country: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pincode: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    GSTIN: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    PAN: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateCustomerSchema: z.ZodObject<{
    customer_name: z.ZodOptional<z.ZodString>;
    company_name: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    billing_address: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    shipping_address: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    city: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    state: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    country: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    pincode: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    GSTIN: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    PAN: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=customer.validator.d.ts.map