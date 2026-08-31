'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _contact = require('../controllers/contact.controller');
var _auth = require('../middlewares/auth.middleware');
var _rbac = require('../middlewares/rbac.middleware');
var _client = require('@prisma/client');
const router = (0, _express.Router)();

// Public route to submit a contact form
router.post('/', _contact.createLead);

// Protected super admin routes
router.get(
  '/',
  _auth.authenticate,
  (0, _rbac.requireRole)([_client.Role.SUPER_ADMIN]),
  _contact.getLeads
);
router.patch(
  '/:id/read',
  _auth.authenticate,
  (0, _rbac.requireRole)([_client.Role.SUPER_ADMIN]),
  _contact.markLeadAsRead
);
var _default = (exports.default = router);
