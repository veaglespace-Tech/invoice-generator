'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.errorHandler = void 0;
var _express = require('express');
var _zod = require('zod');
const FIELD_LABELS = {
  customer_name: 'Customer Name',
  company_name: 'Company Name',
  email: 'Email',
  phone: 'Phone Number',
  billing_address: 'Billing Address',
  shipping_address: 'Shipping Address',
  invoice_number: 'Invoice Number',
  invoice_date: 'Invoice Date',
  due_date: 'Due Date',
  description: 'Item Description',
  quantity: 'Quantity',
  rate: 'Rate',
  tax_rate: 'Tax Rate',
  discount: 'Discount',
  customer_id: 'Customer',
  items: 'Items'
};

function humanizeIssue(issue) {
  const path = issue.path.join('.');
  const parts = issue.path;
  let label = 'Field';

  if (parts.length > 0) {
    if (parts[0] === 'items' && parts.length >= 3) {
      const itemNum = Number(parts[1]) + 1;
      const subField = FIELD_LABELS[parts[2]] || parts[2];
      label = `Item #${itemNum} ${subField}`;
    } else {
      const last = parts[parts.length - 1];
      label = FIELD_LABELS[last] || String(last).replace(/_/g, ' ');
    }
  }

  if (issue.code === 'invalid_type') {
    if (issue.received === 'undefined' || issue.received === 'null') {
      return `${label} is required.`;
    }
    if (issue.expected === 'number') {
      return `${label} must be a valid number.`;
    }
  }
  if (issue.code === 'too_small') {
    if (issue.type === 'string') {
      return `${label} is required.`;
    }
    if (issue.type === 'array') {
      return `Please add at least one item.`;
    }
  }
  if (issue.message && issue.message !== 'Required') {
    return issue.message.includes(label) ? issue.message : `${label}: ${issue.message}`;
  }
  return `${label} is required.`;
}

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof _zod.ZodError) {
    const formattedIssues = err.issues.map(humanizeIssue);
    const primaryMessage = formattedIssues[0] || 'Please check the required fields.';
    return res.status(400).json({
      success: false,
      message: primaryMessage,
      errors: err.issues.map((e, idx) => ({
        path: e.path.join('.'),
        message: formattedIssues[idx] || e.message
      }))
    });
  }

  // Handle Prisma errors generically if needed
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    let friendlyMessage = 'A database error occurred. Please try again.';
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(', ')
        : String(err.meta?.target || '');
      if (target.includes('invoice_number')) {
        friendlyMessage = 'This invoice number already exists. Please choose a different invoice number.';
      } else if (target.includes('email')) {
        friendlyMessage = 'A record with this email address already exists.';
      } else if (target.includes('phone')) {
        friendlyMessage = 'A record with this phone number already exists.';
      } else {
        friendlyMessage = 'A duplicate entry already exists with these details.';
      }
    } else if (err.code === 'P2025') {
      friendlyMessage = 'The requested record was not found.';
    } else if (err.code === 'P2003') {
      friendlyMessage = 'Referenced customer or record was not found.';
    }

    return res.status(400).json({
      success: false,
      message: friendlyMessage
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong. Please try again.';
  res.status(statusCode).json({
    success: false,
    message,
    errors: process.env.NODE_ENV === 'development' && err.stack ? [err.stack] : []
  });
};
exports.errorHandler = errorHandler;
