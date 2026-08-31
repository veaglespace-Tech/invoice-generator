'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _user = require('../controllers/user.controller');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
const router = (0, _express.Router)();

// All routes require authentication
router.use(_auth.authenticate);

// Super Admin or Organization Admin can manage users
router.get(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _user.getAllUsers
);
router.post(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _user.createUser
);
router.get(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _user.getUserById
);
router.put(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _user.updateUser
);
router.put('/:id/password', _user.changePassword);
router.delete(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _user.deleteUser
);
var _default = (exports.default = router);
