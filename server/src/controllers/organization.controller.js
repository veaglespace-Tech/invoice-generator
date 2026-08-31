'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updateOrganizationStatus =
  exports.updateOrganization =
  exports.getOrganizationById =
  exports.getMeOrg =
  exports.getAllOrganizations =
  exports.deleteOrganization =
  exports.createOrganization =
    void 0;
var _express = require('express');
var _server = require('../server');
var _client = require('@prisma/client');
var _organization = require('../validators/organization.validator');
var _hash = require('../utils/hash');
const getAllOrganizations = async (req, res, next) => {
  try {
    const orgs = await _server.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            invoices: true
          }
        }
      }
    });
    res.status(200).json({
      success: true,
      data: orgs
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllOrganizations = getAllOrganizations;
const getOrganizationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Enforce data isolation if not Super Admin
    if (
      req.user?.role !== _client.Role.SUPER_ADMIN &&
      req.user?.organization_id !== id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }
    const org = await _server.prisma.organization.findUnique({
      where: {
        id
      },
      include: {
        settings: true
      }
    });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }
    res.status(200).json({
      success: true,
      data: org
    });
  } catch (error) {
    next(error);
  }
};
exports.getOrganizationById = getOrganizationById;
const createOrganization = async (req, res, next) => {
  try {
    const data = _organization.createOrganizationSchema.parse(req.body);
    const existingUser = await _server.prisma.user.findUnique({
      where: {
        email: data.email
      }
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists for admin user'
      });
    }
    const hashedPassword = await (0, _hash.hashPassword)(data.adminPassword);
    const result = await _server.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          email: data.email
        }
      });
      const user = await tx.user.create({
        data: {
          organization_id: org.id,
          name: data.adminName,
          email: data.email,
          password: hashedPassword,
          role: _client.Role.ORGANIZATION_ADMIN
        }
      });
      await tx.invoiceSetting.create({
        data: {
          organization_id: org.id
        }
      });
      return org;
    });
    res.status(201).json({
      success: true,
      message: 'Organization created',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
exports.createOrganization = createOrganization;
const updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { settings, ...orgData } =
      _organization.updateOrganizationSchema.parse(req.body);
    if (
      req.user?.role !== _client.Role.SUPER_ADMIN &&
      req.user?.organization_id !== id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      delete orgData.plan_id; // Normal admins cannot change plan directly
    }
    const org = await _server.prisma.organization.update({
      where: {
        id
      },
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
    res.status(200).json({
      success: true,
      message: 'Organization updated',
      data: org
    });
  } catch (error) {
    next(error);
  }
};
exports.updateOrganization = updateOrganization;
const updateOrganizationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = _organization.updateOrgStatusSchema.parse(req.body);
    const org = await _server.prisma.organization.update({
      where: {
        id
      },
      data: {
        status
      }
    });
    res.status(200).json({
      success: true,
      message: `Organization status updated to ${status}`,
      data: org
    });
  } catch (error) {
    next(error);
  }
};
exports.updateOrganizationStatus = updateOrganizationStatus;
const deleteOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    await _server.prisma.organization.update({
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
      message: 'Organization deleted'
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteOrganization = deleteOrganization;
const getMeOrg = async (req, res, next) => {
  try {
    const orgId = req.user?.organization_id;
    if (!orgId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    const org = await _server.prisma.organization.findUnique({
      where: {
        id: orgId
      },
      include: {
        settings: true
      }
    });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }
    res.status(200).json({
      success: true,
      data: org
    });
  } catch (error) {
    next(error);
  }
};
exports.getMeOrg = getMeOrg;
