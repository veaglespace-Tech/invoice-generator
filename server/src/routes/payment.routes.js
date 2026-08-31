'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _payment = require('../controllers/payment.controller');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
const router = (0, _express.Router)();
router.use(_auth.authenticate);
router.get(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _payment.getAllPayments
);
router.post(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _payment.addPayment
);
router.delete(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _payment.deletePayment
);
var _default = (exports.default = router);
