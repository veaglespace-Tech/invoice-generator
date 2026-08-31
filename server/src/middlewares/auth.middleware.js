'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.authenticate = void 0;
var _express = require('express');
var _jwt = require('../utils/jwt');
var _server = require('../server');
var _client = require('@prisma/client');
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, _jwt.verifyAccessToken)(token);
    const user = await _server.prisma.user.findUnique({
      where: {
        id: decoded.id
      },
      select: {
        id: true,
        organization_id: true,
        role: true,
        status: true,
        is_deleted: true
      }
    });
    if (!user || user.is_deleted || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User is invalid or inactive'
      });
    }
    req.user = {
      id: user.id,
      organization_id: user.organization_id,
      role: user.role
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token'
    });
  }
};
exports.authenticate = authenticate;
