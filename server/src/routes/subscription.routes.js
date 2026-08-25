"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
// To handle PayU redirects correctly, these must not be blocked by JWT token requirements
// PayU sends POST requests from their server directly, so no JWT token is present on success/fail URLs.
router.post('/success', express_2.default.urlencoded({ extended: true }), subscription_controller_1.handlePaymentSuccess);
router.post('/fail', express_2.default.urlencoded({ extended: true }), subscription_controller_1.handlePaymentFail);
// Protected routes for the user
router.use(auth_middleware_1.authenticate);
router.post('/initiate', subscription_controller_1.initiateSubscription);
router.get('/current', subscription_controller_1.getCurrentSubscription);
exports.default = router;
//# sourceMappingURL=subscription.routes.js.map