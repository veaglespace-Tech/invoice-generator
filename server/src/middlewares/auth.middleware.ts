import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../server';
import { Role } from '@prisma/client';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, organization_id: true, role: true, status: true, is_deleted: true }
    });

    if (!user || user.is_deleted || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Unauthorized: User is invalid or inactive' });
    }

    req.user = {
      id: user.id,
      organization_id: user.organization_id,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};
