"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
    }
    // Handle Prisma errors generically if needed
    if (err.code && err.code.startsWith('P')) {
        return res.status(400).json({
            success: false,
            message: 'Database Error',
            errors: [{ message: err.message }]
        });
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        errors: process.env.NODE_ENV === 'development' ? [err.stack] : []
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map