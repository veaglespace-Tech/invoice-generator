'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
var _express = _interopRequireWildcard(require('express'));
var _cors = _interopRequireDefault(require('cors'));
var _helmet = _interopRequireDefault(require('helmet'));
var _expressRateLimit = _interopRequireDefault(require('express-rate-limit'));
var _auth = _interopRequireDefault(require('./routes/auth.routes'));
var _organization = _interopRequireDefault(
  require('./routes/organization.routes')
);
var _user = _interopRequireDefault(require('./routes/user.routes'));
var _customer = _interopRequireDefault(require('./routes/customer.routes'));
var _product = _interopRequireDefault(require('./routes/product.routes'));
var _invoice = _interopRequireDefault(require('./routes/invoice.routes'));
var _payment = _interopRequireDefault(require('./routes/payment.routes'));
var _dashboard = _interopRequireDefault(require('./routes/dashboard.routes'));
var _auditLog = _interopRequireDefault(require('./routes/auditLog.routes'));
var _subscription = _interopRequireDefault(
  require('./routes/subscription.routes')
);
var _contact = _interopRequireDefault(require('./routes/contact.routes'));
var _plan = _interopRequireDefault(require('./routes/plan.routes'));
var _error = require('./middlewares/error.middleware');
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
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
const app = (0, _express.default)();

// Security Middlewares
app.use((0, _helmet.default)());
app.use((0, _cors.default)());

// Rate Limiter
const apiLimiter = (0, _expressRateLimit.default)({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 1000,
  // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Apply rate limiter to all /api routes
app.use('/api', apiLimiter);

// Body Parsers
app.use(
  _express.default.json({
    limit: '10mb'
  })
);
app.use(
  _express.default.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

// API Routes
app.use('/api/v1/auth', _auth.default);
app.use('/api/v1/organizations', _organization.default);
app.use('/api/v1/users', _user.default);
app.use('/api/v1/customers', _customer.default);
app.use('/api/v1/products', _product.default);
app.use('/api/v1/invoices', _invoice.default);
app.use('/api/v1/payments', _payment.default);
app.use('/api/v1/dashboard', _dashboard.default);
app.use('/api/v1/audit-logs', _auditLog.default);
app.use('/api/v1/subscriptions', _subscription.default);
app.use('/api/v1/contact', _contact.default);
app.use('/api/v1/plans', _plan.default);

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Org Invoice System API is running'
  });
});

// Global Error Handler
app.use(_error.errorHandler);
var _default = (exports.default = app);
