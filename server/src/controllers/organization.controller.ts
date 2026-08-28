import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { Prisma, Role } from '@prisma/client';
import { createOrganizationSchema, updateOrganizationSchema, updateOrgStatusSchema } from '../validators/organization.validator';
import { hashPassword } from '../utils/hash';

export const getAllOrganizations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: { users: true, customers: true, invoices: true }
        }
      }
    });
    res.status(200).json({ success: true, data: orgs });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Enforce data isolation if not Super Admin
    if (req.user?.role !== Role.SUPER_ADMIN && req.user?.organization_id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        settings: true
      }
    });

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    res.status(200).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

export const createOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createOrganizationSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists for admin user' });
    }

    const hashedPassword = await hashPassword(data.adminPassword);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          email: data.email,
        }
      });

      const user = await tx.user.create({
        data: {
          organization_id: org.id,
          name: data.adminName,
          email: data.email,
          password: hashedPassword,
          role: Role.ORGANIZATION_ADMIN
        }
      });

      await tx.invoiceSetting.create({
        data: { organization_id: org.id }
      });

      return org;
    });

    res.status(201).json({ success: true, message: 'Organization created', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { settings, ...orgData } = updateOrganizationSchema.parse(req.body);

    if (req.user?.role !== Role.SUPER_ADMIN && req.user?.organization_id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (req.user?.role !== Role.SUPER_ADMIN) {
      delete (orgData as any).plan; // Normal admins cannot change plan directly
    }

    const org = await prisma.organization.update({
      where: { id },
      data: {
        ...orgData,
        ...(settings && {
          settings: {
            upsert: {
              create: settings,
              update: settings
            }
          }
        })
      },
      include: {
        settings: true
      }
    });

    res.status(200).json({ success: true, message: 'Organization updated', data: org });
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = updateOrgStatusSchema.parse(req.body);

    const org = await prisma.organization.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, message: `Organization status updated to ${status}`, data: org });
  } catch (error) {
    next(error);
  }
};

export const deleteOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.organization.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date()
      }
    });

    res.status(200).json({ success: true, message: 'Organization deleted' });
  } catch (error) {
    next(error);
  }
};

export const getMeOrg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    if (!orgId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        settings: true
      }
    });

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    res.status(200).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};
