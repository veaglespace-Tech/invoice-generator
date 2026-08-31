'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _dashboard = require('../controllers/dashboard.controller');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
const router = (0, _express.Router)();
router.use(_auth.authenticate);
router.get(
  '/super-admin',
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _dashboard.getSuperAdminDashboard
);
router.get(
  '/org',
  (0, _rbac.requireRole)(['ORGANIZATION_ADMIN', 'STAFF']),
  _dashboard.getOrganizationDashboard
);
var _default = (exports.default = router);
