'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = _interopRequireWildcard(require('express'));
var _subscription = require('../controllers/subscription.controller');
var _auth = require('../middlewares/auth.middleware');
function _interopRequireWildcard(e, t) {
  if ('function' == typeof WeakMap)
    var r = new WeakMap(),
      n = new WeakMap();
  return (_interopRequireWildcard = function (e, t) {
    if (!t && e && e.__esModule) return e;
    var o,
      i,
      f = { __proto__: null, default: e };
    if (null === e || ('object' != typeof e && 'function' != typeof e))
      return f;
    if ((o = t ? n : r)) {
      if (o.has(e)) return o.get(e);
      o.set(e, f);
    }
    for (const t in e)
      'default' !== t &&
        {}.hasOwnProperty.call(e, t) &&
        ((i =
          (o = Object.defineProperty) &&
          Object.getOwnPropertyDescriptor(e, t)) &&
        (i.get || i.set)
          ? o(f, t, i)
          : (f[t] = e[t]));
    return f;
  })(e, t);
}
const router = (0, _express.Router)();

// To handle PayU redirects correctly, these must not be blocked by JWT token requirements
// PayU sends POST requests from their server directly, so no JWT token is present on success/fail URLs.
router.post(
  '/success',
  _express.default.urlencoded({
    extended: true
  }),
  _subscription.handlePaymentSuccess
);
router.post(
  '/fail',
  _express.default.urlencoded({
    extended: true
  }),
  _subscription.handlePaymentFail
);

// Protected routes for the user
router.use(_auth.authenticate);
router.post('/initiate', _subscription.initiateSubscription);
router.get('/current', _subscription.getCurrentSubscription);
var _default = (exports.default = router);
