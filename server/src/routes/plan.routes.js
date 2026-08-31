'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
var _plan = require('../controllers/plan.controller');
const router = (0, _express.Router)();

// Public route to get active plans
router.get('/', _plan.getAllPlans);

// Protected routes for SUPER_ADMIN
router.get(
  '/admin',
  _auth.authenticate,
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _plan.getAdminPlans
);
router.post(
  '/',
  _auth.authenticate,
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _plan.createPlan
);
router.put(
  '/:id',
  _auth.authenticate,
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _plan.updatePlan
);
router.delete(
  '/:id',
  _auth.authenticate,
  (0, _rbac.requireRole)(['SUPER_ADMIN']),
  _plan.deletePlan
);
var _default = (exports.default = router);
