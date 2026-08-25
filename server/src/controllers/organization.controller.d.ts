import { Request, Response, NextFunction } from 'express';
export declare const getAllOrganizations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrganizationById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createOrganization: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateOrganization: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateOrganizationStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteOrganization: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMeOrg: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=organization.controller.d.ts.map