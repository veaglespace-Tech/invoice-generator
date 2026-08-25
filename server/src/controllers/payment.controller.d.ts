import { Request, Response, NextFunction } from 'express';
export declare const getAllPayments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addPayment: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePayment: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payment.controller.d.ts.map