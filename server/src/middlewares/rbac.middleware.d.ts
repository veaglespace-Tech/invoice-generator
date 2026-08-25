import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export declare const requireRole: (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requirePermission: (permission: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=rbac.middleware.d.ts.map