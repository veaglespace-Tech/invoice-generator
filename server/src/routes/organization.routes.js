'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _organization = require('../controllers/organization.controller');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
const router = (0, _express.Router)();

// All routes require authentication
router.use(_auth.authenticate);

// Organization specific route
router.get(
  '/me',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _organization.getMeOrg
);

// Super Admin only routes
router.get(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _organization.getAllOrganizations
);
router.post(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _organization.createOrganization
);
router.patch(
  '/:id/status',
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _organization.updateOrganizationStatus
);
router.delete(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _organization.deleteOrganization
);

// Super Admin or Organization Admin
router.get(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _organization.getOrganizationById
);
router.put(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _organization.updateOrganization
);
var _default = (exports.default = router);
