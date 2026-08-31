'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _invoice = require('../controllers/invoice.controller');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
const router = (0, _express.Router)();
router.use(_auth.authenticate);
router.get(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _invoice.getAllInvoices
);
router.post(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _invoice.createInvoice
);
router.get(
  '/next-number',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _invoice.getNextInvoiceNumber
);
router.get(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _invoice.getInvoiceById
);
router.get(
  '/:id/pdf',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _invoice.downloadInvoicePDF
);
router.post(
  '/:id/send',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _invoice.sendInvoice
);
router.patch(
  '/:id/status',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _invoice.updateInvoiceStatus
);
router.delete(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _invoice.deleteInvoice
);
var _default = (exports.default = router);
