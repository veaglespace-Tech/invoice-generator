import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { Prisma, Role } from '@prisma/client';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Prisma.AuditLogWhereInput = {};

    if (req.user?.role !== Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id as string;
    }

    const logs = await prisma.auditLog.findMany({
      where: filter,
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 100 // pagination could be implemented here
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
