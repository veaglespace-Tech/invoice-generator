import { Request, Response, NextFunction } from 'express';
export declare const getAllCustomers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCustomerById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCustomer: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCustomer: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCustomer: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=customer.controller.d.ts.map