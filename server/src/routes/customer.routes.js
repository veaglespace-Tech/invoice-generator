'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _customer = require('../controllers/customer.controller');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
const router = (0, _express.Router)();
router.use(_auth.authenticate);

// STAFF can only access if they have permissions. In a real system you might have `requirePermission('VIEW_CUSTOMERS')` etc.
// For now, let's allow SUPER_ADMIN, ORGANIZATION_ADMIN and STAFF (but staff permissions would be checked in business logic or fine-grained middleware)
router.get(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _customer.getAllCustomers
);
router.post(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _customer.createCustomer
);
router.get(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _customer.getCustomerById
);
router.put(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _customer.updateCustomer
);
router.delete(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _customer.deleteCustomer
);
var _default = (exports.default = router);
