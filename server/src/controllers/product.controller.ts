import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { is_deleted: false };

    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }

    const products = await prisma.product.findMany({ where: filter });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const product = await prisma.product.findFirst({ where: filter });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProductSchema.parse(req.body);
    
    let targetOrgId = req.user?.organization_id;
    if (req.user?.role === 'SUPER_ADMIN' && req.body.organization_id) {
      targetOrgId = req.body.organization_id;
    }

    if (!targetOrgId) {
      return res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        organization_id: targetOrgId
      }
    });

    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateProductSchema.parse(req.body);

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const existingProduct = await prisma.product.findFirst({ where: filter });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data
    });

    res.status(200).json({ success: true, message: 'Product updated', data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const existingProduct = await prisma.product.findFirst({ where: filter });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await prisma.product.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() }
    });

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
