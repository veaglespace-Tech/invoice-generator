'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updateCustomer =
  exports.getCustomerById =
  exports.getAllCustomers =
  exports.deleteCustomer =
  exports.createCustomer =
    void 0;
var _express = require('express');
var _server = require('../server');
var _client = require('@prisma/client');
var _customer = require('../validators/customer.validator');
const getAllCustomers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      _server.prisma.customer.findMany({
        where: filter,
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      _server.prisma.customer.count({
        where: filter
      })
    ]);
    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllCustomers = getAllCustomers;
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = {
      id
    };
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    }
    const customer = await _server.prisma.customer.findFirst({
      where: filter
    });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};
exports.getCustomerById = getCustomerById;
const createCustomer = async (req, res, next) => {
  try {
    const data = _customer.createCustomerSchema.parse(req.body);

    // Default to req.user.organization_id unless SUPER_ADMIN specifies one
    let targetOrgId = req.user?.organization_id;
    if (
      req.user?.role === _client.Role.SUPER_ADMIN &&
      req.body.organization_id
    ) {
      targetOrgId = req.body.organization_id;
    }
    if (!targetOrgId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    // Subscription limits enforcement
    const subscription = await _server.prisma.subscription.findFirst({
      where: {
        organization_id: targetOrgId,
        status: 'ACTIVE'
      },
      include: { 
        plan: true,
        organization: true 
      },
      orderBy: { created_at: 'desc' }
    });

    if (subscription) {
      const allowedMaxCustomers = subscription.organization.custom_max_customers !== null
        ? subscription.organization.custom_max_customers
        : subscription.plan.max_customers;

      if (allowedMaxCustomers !== -1) {
        const customerCount = await _server.prisma.customer.count({
          where: {
            organization_id: targetOrgId,
            is_deleted: false
          }
        });
        if (customerCount >= allowedMaxCustomers) {
          return res.status(403).json({
            success: false,
            message: `Customer limit reached. Your current plan allows up to ${allowedMaxCustomers} active customers.`
          });
        }
      }
    }

    // Prevent duplicate customers
    const trimmedEmail = data.email?.trim() || null;
    const trimmedPhone = data.phone?.trim() || null;
    const trimmedGstin = data.GSTIN?.trim() || null;
    const trimmedName = data.customer_name?.trim() || null;
    const trimmedCompany = data.company_name?.trim() || null;

    if (trimmedEmail) {
      const existing = await _server.prisma.customer.findFirst({
        where: {
          email: trimmedEmail,
          organization_id: targetOrgId
        }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A customer with this email (${trimmedEmail}) already exists (${existing.customer_name})`
        });
      }
    }

    if (trimmedPhone) {
      const existing = await _server.prisma.customer.findFirst({
        where: {
          phone: trimmedPhone,
          organization_id: targetOrgId
        }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A customer with this phone number (${trimmedPhone}) already exists (${existing.customer_name})`
        });
      }
    }

    if (trimmedGstin) {
      const existing = await _server.prisma.customer.findFirst({
        where: {
          GSTIN: trimmedGstin,
          organization_id: targetOrgId
        }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A customer with this GSTIN (${trimmedGstin}) already exists (${existing.customer_name})`
        });
      }
    }

    if (trimmedName && trimmedCompany) {
      const existing = await _server.prisma.customer.findFirst({
        where: {
          customer_name: trimmedName,
          company_name: trimmedCompany,
          organization_id: targetOrgId
        }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A customer record for "${trimmedName}" from "${trimmedCompany}" already exists`
        });
      }
    }

    const customer = await _server.prisma.customer.create({
      data: {
        ...data,
        email: trimmedEmail,
        phone: trimmedPhone,
        GSTIN: trimmedGstin,
        customer_name: trimmedName,
        company_name: trimmedCompany,
        organization_id: targetOrgId
      }
    });
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = _customer.updateCustomerSchema.parse(req.body);
    const filter = {
      id
    };
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    }
    const existingCustomer = await _server.prisma.customer.findFirst({
      where: filter
    });
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const trimmedEmail = data.email !== undefined ? (data.email?.trim() || null) : undefined;
    const trimmedPhone = data.phone !== undefined ? (data.phone?.trim() || null) : undefined;
    const trimmedGstin = data.GSTIN !== undefined ? (data.GSTIN?.trim() || null) : undefined;

    if (trimmedEmail && trimmedEmail !== existingCustomer.email) {
      const emailExists = await _server.prisma.customer.findFirst({
        where: {
          email: trimmedEmail,
          organization_id: existingCustomer.organization_id,
          id: {
            not: id
          }
        }
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: `A customer with this email (${trimmedEmail}) already exists (${emailExists.customer_name})`
        });
      }
    }

    if (trimmedPhone && trimmedPhone !== existingCustomer.phone) {
      const phoneExists = await _server.prisma.customer.findFirst({
        where: {
          phone: trimmedPhone,
          organization_id: existingCustomer.organization_id,
          id: {
            not: id
          }
        }
      });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: `A customer with this phone number (${trimmedPhone}) already exists (${phoneExists.customer_name})`
        });
      }
    }

    if (trimmedGstin && trimmedGstin !== existingCustomer.GSTIN) {
      const gstinExists = await _server.prisma.customer.findFirst({
        where: {
          GSTIN: trimmedGstin,
          organization_id: existingCustomer.organization_id,
          id: {
            not: id
          }
        }
      });
      if (gstinExists) {
        return res.status(400).json({
          success: false,
          message: `A customer with this GSTIN (${trimmedGstin}) already exists (${gstinExists.customer_name})`
        });
      }
    }

    const updatedCustomer = await _server.prisma.customer.update({
      where: {
        id
      },
      data
    });
    res.status(200).json({
      success: true,
      message: 'Customer updated',
      data: updatedCustomer
    });
  } catch (error) {
    next(error);
  }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = {
      id
    };
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    }
    const existingCustomer = await _server.prisma.customer.findFirst({
      where: filter
    });
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    await _server.prisma.customer.update({
      where: {
        id
      },
      data: {
        is_deleted: true,
        deleted_at: new Date()
      }
    });
    res.status(200).json({
      success: true,
      message: 'Customer deleted'
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteCustomer = deleteCustomer;
