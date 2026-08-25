import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { hashPassword } from '../utils/hash';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { is_deleted: false };

    // Org Admin can only see their org's users
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }

    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        last_login: true,
        created_at: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id, is_deleted: false },
      include: {
        permissions: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Isolate data
    if (req.user?.role !== 'SUPER_ADMIN' && user.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Exclude password
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);

    // Organization ID logic
    let targetOrgId = req.user?.organization_id;
    if (req.user?.role === 'SUPER_ADMIN' && data.organization_id) {
      targetOrgId = data.organization_id;
    }

    if (!targetOrgId && data.role !== 'SUPER_ADMIN') {
      return res.status(400).json({ success: false, message: 'Organization ID is required for non-super admins' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(data.password);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role,
          organization_id: data.role === 'SUPER_ADMIN' ? null : targetOrgId
        }
      });

      if (data.permissions && data.permissions.length > 0) {
        await tx.userPermission.createMany({
          data: data.permissions.map(p => ({
            user_id: newUser.id,
            permission: p
          }))
        });
      }

      return newUser;
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: { id: result.id } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id, is_deleted: false } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user?.role !== 'SUPER_ADMIN' && user.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          name: data.name,
          role: data.role,
          status: data.status,
        }
      });

      if (data.permissions) {
        await tx.userPermission.deleteMany({ where: { user_id: id } });
        if (data.permissions.length > 0) {
          await tx.userPermission.createMany({
            data: data.permissions.map(p => ({
              user_id: id,
              permission: p
            }))
          });
        }
      }

      return updatedUser;
    });

    res.status(200).json({ success: true, message: 'User updated', data: { id: result.id } });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id, is_deleted: false } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user?.role !== 'SUPER_ADMIN' && user.organization_id !== req.user?.organization_id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (id === req.user?.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    await prisma.user.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() }
    });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
