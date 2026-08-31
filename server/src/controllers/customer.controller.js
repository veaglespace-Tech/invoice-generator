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
    const customer = await _server.prisma.customer.create({
      data: {
        ...data,
        organization_id: targetOrgId
      }
    });
    res.status(201).json({
      success: true,
      message: 'Customer created',
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
