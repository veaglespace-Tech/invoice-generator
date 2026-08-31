'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.errorHandler = void 0;
var _express = require('express');
var _zod = require('zod');
const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err instanceof _zod.ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.issues.map((e) => ({
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
      errors: [
        {
          message: err.message
        }
      ]
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
