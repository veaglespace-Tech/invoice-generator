import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organization_id: string | null;
        role: Role;
      };
    }
  }
}
