import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        SUPER_ADMIN: 'SUPER_ADMIN';
        ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN';
        STAFF: 'STAFF';
    }>;
    organization_id: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        SUPER_ADMIN: 'SUPER_ADMIN';
        ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN';
        STAFF: 'STAFF';
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>;
    avatar: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=user.validator.d.ts.map