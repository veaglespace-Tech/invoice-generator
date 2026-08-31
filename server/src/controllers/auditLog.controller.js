'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getAuditLogs = void 0;
var _express = require('express');
var _server = require('../server');
var _client = require('@prisma/client');
const getAuditLogs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }
    const logs = await _server.prisma.auditLog.findMany({
      where: filter,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 100 // pagination could be implemented here
    });
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
exports.getAuditLogs = getAuditLogs;
