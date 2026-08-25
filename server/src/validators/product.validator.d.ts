import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    SKU: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodEnum<{
        PRODUCT: 'PRODUCT';
        SERVICE: 'SERVICE';
    }>;
    unit: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    price: z.ZodNumber;
    tax_rate: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    SKU: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    type: z.ZodOptional<z.ZodEnum<{
        PRODUCT: 'PRODUCT';
        SERVICE: 'SERVICE';
    }>>;
    unit: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    price: z.ZodOptional<z.ZodNumber>;
    tax_rate: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=product.validator.d.ts.map