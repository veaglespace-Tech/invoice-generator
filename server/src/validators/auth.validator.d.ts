import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const registerOrgSchema: z.ZodObject<{
    orgName: z.ZodString;
    userName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    legalName: z.ZodOptional<z.ZodString>;
    orgPhone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    GSTIN: z.ZodOptional<z.ZodString>;
    PAN: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=auth.validator.d.ts.map