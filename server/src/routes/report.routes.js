'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;

var _express = require('express');
var _report = require('../controllers/report.controller');
var _auth = require('../middlewares/auth.middleware');

const router = (0, _express.Router)();

router.use(_auth.authenticate);

router.get('/', _report.getReports);

var _default = exports.default = router;
