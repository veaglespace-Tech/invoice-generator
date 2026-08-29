import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const planSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().optional(),
  interval: z.string().optional(),
  features: z.array(z.string()).optional(),
  is_popular: z.boolean().optional(),
  is_active: z.boolean().optional()
});

export const getAllPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' }
    });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

export const getAdminPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = planSchema.parse(req.body);

    const plan = await prisma.plan.create({
      data: {
        ...data,
        features: data.features || []
      }
    });

    res.status(201).json({ success: true, message: 'Plan created successfully', data: plan });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = planSchema.partial().parse(req.body);

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...data,
        ...(data.features ? { features: data.features } : {})
      }
    });

    res.status(200).json({ success: true, message: 'Plan updated successfully', data: plan });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if any organizations use this plan
    const orgCount = await prisma.organization.count({ where: { plan_id: id } });
    if (orgCount > 0) {
      // Instead of deleting, just deactivate
      await prisma.plan.update({
        where: { id },
        data: { is_active: false }
      });
      return res.status(200).json({ success: true, message: 'Plan deactivated because it is in use.' });
    }

    await prisma.plan.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};
