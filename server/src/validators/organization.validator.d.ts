import { z } from 'zod';
export declare const createOrganizationSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    adminName: z.ZodString;
    adminPassword: z.ZodString;
}, z.core.$strip>;
export declare const updateOrganizationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    legal_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    city: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    state: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    country: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pincode: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    GSTIN: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    PAN: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    logo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    website: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    currency: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    plan: z.ZodOptional<z.ZodEnum<{
        BASIC: "BASIC";
        FREE: "FREE";
        PRO: "PRO";
    }>>;
    settings: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        supplier_state_code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        transaction_type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        merchant_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hsn_code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        signature_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        signature_location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        terms_conditions: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateOrgStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        SUSPENDED: "SUSPENDED";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=organization.validator.d.ts.map