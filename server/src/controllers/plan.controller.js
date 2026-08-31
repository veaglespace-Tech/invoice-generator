'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updatePlan =
  exports.getAllPlans =
  exports.getAdminPlans =
  exports.deletePlan =
  exports.createPlan =
    void 0;
var _express = require('express');
var _client = require('@prisma/client');
var _zod = require('zod');
const prisma = new _client.PrismaClient();
const planSchema = _zod.z.object({
  name: _zod.z.string().min(2, 'Name is required'),
  description: _zod.z.string().optional().nullable(),
  price: _zod.z.number().min(0, 'Price must be non-negative'),
  currency: _zod.z.string().optional(),
  interval: _zod.z.string().optional(),
  features: _zod.z.array(_zod.z.string()).optional(),
  is_popular: _zod.z.boolean().optional(),
  is_active: _zod.z.boolean().optional()
});
const getAllPlans = async (req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        price: 'asc'
      }
    });
    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllPlans = getAllPlans;
const getAdminPlans = async (req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc'
      }
    });
    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};
exports.getAdminPlans = getAdminPlans;
const createPlan = async (req, res, next) => {
  try {
    const data = planSchema.parse(req.body);
    const plan = await prisma.plan.create({
      data: {
        ...data,
        features: data.features || []
      }
    });
    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};
exports.createPlan = createPlan;
const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = planSchema.partial().parse(req.body);
    const plan = await prisma.plan.update({
      where: {
        id
      },
      data: {
        ...data,
        ...(data.features
          ? {
              features: data.features
            }
          : {})
      }
    });
    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if any organizations use this plan
    const orgCount = await prisma.organization.count({
      where: {
        plan_id: id
      }
    });
    if (orgCount > 0) {
      // Instead of deleting, just deactivate
      await prisma.plan.update({
        where: {
          id
        },
        data: {
          is_active: false
        }
      });
      return res.status(200).json({
        success: true,
        message: 'Plan deactivated because it is in use.'
      });
    }
    await prisma.plan.delete({
      where: {
        id
      }
    });
    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
exports.deletePlan = deletePlan;
