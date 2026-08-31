'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _product = require('../controllers/product.controller');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
const router = (0, _express.Router)();
router.use(_auth.authenticate);
router.get(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _product.getAllProducts
);
router.post(
  '/',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _product.createProduct
);
router.get(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _product.getProductById
);
router.put(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']),
  _product.updateProduct
);
router.delete(
  '/:id',
  (0, _rbac.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']),
  _product.deleteProduct
);
var _default = (exports.default = router);
