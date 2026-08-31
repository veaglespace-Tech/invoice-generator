'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = require('express');
var _auth = require('../controllers/auth.controller');
var _auth2 = require('../middlewares/auth.middleware');
const router = (0, _express.Router)();
router.post('/register', _auth.registerOrganization);
router.post('/login', _auth.login);
router.post('/refresh-token', _auth.refresh);
router.post('/logout', _auth.logout);
router.get('/me', _auth2.authenticate, _auth.getMe);
var _default = (exports.default = router);
