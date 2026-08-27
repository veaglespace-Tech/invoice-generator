import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { loginSchema, registerOrgSchema, refreshTokenSchema } from '../validators/auth.validator';

export const registerOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerOrgSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(data.password);

    // Use transaction to ensure both Org and User are created
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.orgName,
          email: data.email,
          legal_name: data.legalName,
          phone: data.orgPhone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          GSTIN: data.GSTIN,
          PAN: data.PAN
        }
      });

      const user = await tx.user.create({
        data: {
          organization_id: org.id,
          name: data.userName,
          email: data.email,
          password: hashedPassword,
          role: 'ORGANIZATION_ADMIN'
        }
      });

      // Default invoice settings
      await tx.invoiceSetting.create({
        data: {
          organization_id: org.id
        }
      });

      return { org, user };
    });

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      data: {
        organizationId: result.org.id,
        userId: result.user.id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || user.is_deleted || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = { id: user.id, organization_id: user.organization_id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: expiresAt
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization_id: user.organization_id
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        organization_id: true,
        status: true,
        created_at: true,
        organization: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = refreshTokenSchema.parse(req.body);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: data.refreshToken }
    });

    if (!storedToken || storedToken.expires_at < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const decoded = verifyRefreshToken(data.refreshToken) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.is_deleted || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Invalid user' });
    }

    const payload = { id: user.id, organization_id: user.organization_id, role: user.role };
    const newAccessToken = generateAccessToken(payload);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = refreshTokenSchema.parse(req.body);
    await prisma.refreshToken.deleteMany({
      where: { token: data.refreshToken }
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
