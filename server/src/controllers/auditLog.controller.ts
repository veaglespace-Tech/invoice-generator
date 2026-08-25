import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};

    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
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
