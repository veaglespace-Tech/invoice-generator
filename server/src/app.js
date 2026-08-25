"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const organization_routes_1 = __importDefault(require("./routes/organization.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const auditLog_routes_1 = __importDefault(require("./routes/auditLog.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Body Parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/organizations', organization_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/customers', customer_routes_1.default);
app.use('/api/v1/products', product_routes_1.default);
app.use('/api/v1/invoices', invoice_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
app.use('/api/v1/audit-logs', auditLog_routes_1.default);
app.use('/api/v1/subscriptions', subscription_routes_1.default);
// Base Route
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Multi-Org Invoice System API is running' });
});
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map