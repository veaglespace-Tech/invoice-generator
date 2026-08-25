import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';

export const getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { is_deleted: false };

    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }

    const customers = await prisma.customer.findMany({ where: filter });
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const customer = await prisma.customer.findFirst({ where: filter });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCustomerSchema.parse(req.body);
    
    // Default to req.user.organization_id unless SUPER_ADMIN specifies one
    let targetOrgId = req.user?.organization_id;
    if (req.user?.role === 'SUPER_ADMIN' && req.body.organization_id) {
      targetOrgId = req.body.organization_id;
    }

    if (!targetOrgId) {
      return res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        organization_id: targetOrgId
      }
    });

    res.status(201).json({ success: true, message: 'Customer created', data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateCustomerSchema.parse(req.body);

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const existingCustomer = await prisma.customer.findFirst({ where: filter });
    if (!existingCustomer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data
    });

    res.status(200).json({ success: true, message: 'Customer updated', data: updatedCustomer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const existingCustomer = await prisma.customer.findFirst({ where: filter });
    if (!existingCustomer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await prisma.customer.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() }
    });

    res.status(200).json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};
