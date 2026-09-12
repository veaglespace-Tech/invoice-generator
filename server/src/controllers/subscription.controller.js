'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.initiateSubscription =
  exports.handlePaymentSuccess =
  exports.handlePaymentFail =
  exports.getCurrentSubscription =
    void 0;
var _express = require('express');
var _client = require('@prisma/client');
var _crypto = _interopRequireDefault(require('crypto'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const prisma = new _client.PrismaClient();
const PAYU_BASE_URL = process.env.PAYU_BASE_URL || 'https://test.payu.in/_payment';
const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || '';
const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || '';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const initiateSubscription = async (req, res) => {
  try {
    const { plan_id } = req.body;
    const organizationId = req.user?.organization_id;
    if (!organizationId) {
      res.status(403).json({
        success: false,
        error: 'User does not belong to an organization.'
      });
      return;
    }
    if (!plan_id) {
      res.status(400).json({
        success: false,
        error: 'Invalid plan selected.'
      });
      return;
    }
    const planObj = await prisma.plan.findUnique({
      where: {
        id: plan_id
      }
    });
    if (!planObj) {
      res.status(404).json({
        success: false,
        error: 'Plan not found.'
      });
      return;
    }
    const org = await prisma.organization.findUnique({
      where: {
        id: organizationId
      },
      include: {
        users: true
      }
    });
    if (!org) {
      res.status(404).json({
        success: false,
        error: 'Organization not found.'
      });
      return;
    }
    const basePrice = Number(planObj.price);
    const discountAmount = (basePrice * Number(planObj.discount)) / 100;
    const priceAfterDiscount = basePrice - discountAmount;
    const gstRate = Number(planObj.gst_rate) || 18;
    const gstAmount = (priceAfterDiscount * gstRate) / 100;
    const finalAmount = priceAfterDiscount + gstAmount;
    const amount = finalAmount.toFixed(2);
    const txnid = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const productinfo = `${planObj.name} Subscription`;
    const firstname = org.name;
    const email = org.email;
    const phone = org.phone || '9999999999';

    // Surl and Furl
    const surl = `${API_BASE_URL}/subscriptions/success`;
    const furl = `${API_BASE_URL}/subscriptions/fail`;

    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_MERCHANT_SALT}`;
    const hash = _crypto.default
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    // Create a pending subscription in DB
    await prisma.subscription.create({
      data: {
        organization_id: org.id,
        plan_id: planObj.id,
        amount: finalAmount,
        status: 'PENDING',
        txnid
      }
    });
    res.status(200).json({
      success: true,
      data: {
        key: PAYU_MERCHANT_KEY,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        hash,
        action: PAYU_BASE_URL
      }
    });
  } catch (error) {
    console.error('Error initiating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error.'
    });
  }
};
exports.initiateSubscription = initiateSubscription;
const handlePaymentSuccess = async (req, res) => {
  try {
    const {
      txnid,
      status,
      hash,
      amount,
      productinfo,
      firstname,
      email,
      mihpayid
    } = req.body;
    if (status !== 'success') {
      res.redirect(`${FRONTEND_URL}/login?payment=failed`);
      return;
    }

    // Verify Hash
    // Reverse Hash sequence: SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key
    const reverseHashString = `${PAYU_MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
    const calculatedHash = _crypto.default
      .createHash('sha512')
      .update(reverseHashString)
      .digest('hex');
    if (calculatedHash !== hash) {
      console.error('Hash mismatch on PayU success callback!');
      res.redirect(`${FRONTEND_URL}/login?payment=failed`);
      return;
    }

    // Hash is valid, update subscription
    const subscription = await prisma.subscription.findUnique({
      where: { txnid },
      include: { plan: true }
    });
    if (subscription) {
      // Find existing active subscription to carry forward days
      const currentActiveSub = await prisma.subscription.findFirst({
        where: {
          organization_id: subscription.organization_id,
          status: 'ACTIVE'
        },
        orderBy: { created_at: 'desc' }
      });

      let additionalDays = 0;
      if (currentActiveSub && currentActiveSub.end_date) {
        const now = new Date();
        if (currentActiveSub.end_date > now) {
          const diffTime = Math.abs(currentActiveSub.end_date - now);
          additionalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        
        // Deactivate old subscription
        await prisma.subscription.update({
          where: { id: currentActiveSub.id },
          data: { status: 'EXPIRED' }
        });
      }

      // Calculate new end date based on plan interval
      const startDate = new Date();
      const endDate = new Date();
      if (subscription.plan.interval === 'year') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else if (subscription.plan.interval === 'month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (subscription.plan.interval === 'forever') {
        endDate.setFullYear(endDate.getFullYear() + 100);
      } else {
        endDate.setMonth(endDate.getMonth() + 1); // fallback
      }

      // Add carried forward days
      if (additionalDays > 0) {
        endDate.setDate(endDate.getDate() + additionalDays);
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          payu_mihpayid: mihpayid,
          start_date: startDate,
          end_date: endDate
        }
      });

      // Update Org plan
      await prisma.organization.update({
        where: {
          id: subscription.organization_id
        },
        data: {
          plan_id: subscription.plan_id,
          status: 'ACTIVE'
        }
      });
    }
    res.redirect(`${FRONTEND_URL}/payment/success`);
  } catch (error) {
    console.error('Error in handlePaymentSuccess:', error);
    res.redirect(`${FRONTEND_URL}/payment/failed`);
  }
};
exports.handlePaymentSuccess = handlePaymentSuccess;
const handlePaymentFail = async (req, res) => {
  try {
    const { txnid } = req.body;
    if (txnid) {
      await prisma.subscription.update({
        where: {
          txnid
        },
        data: {
          status: 'FAILED'
        }
      });
    }
    res.redirect(`${FRONTEND_URL}/payment/failed`);
  } catch (error) {
    console.error('Error in handlePaymentFail:', error);
    res.redirect(`${FRONTEND_URL}/payment/failed`);
  }
};
exports.handlePaymentFail = handlePaymentFail;
const getCurrentSubscription = async (req, res) => {
  try {
    const organizationId = req.user?.organization_id;
    if (!organizationId) {
      res.status(403).json({
        success: false,
        error: 'User does not belong to an organization.'
      });
      return;
    }
    const subscription = await prisma.subscription.findFirst({
      where: {
        organization_id: organizationId,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    let usage = null;
    if (subscription && subscription.plan) {
      const invoiceCount = await prisma.invoice.count({
        where: {
          organization_id: organizationId,
          created_at: {
            gte: subscription.start_date || new Date(0),
            lte: subscription.end_date || new Date('2099-12-31')
          },
          is_deleted: false
        }
      });
      const customerCount = await prisma.customer.count({
        where: {
          organization_id: organizationId,
          is_deleted: false
        }
      });
      usage = {
        invoices: invoiceCount,
        customers: customerCount
      };
    }
    res.status(200).json({
      success: true,
      data: subscription,
      usage: usage
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error.'
    });
  }
};
exports.getCurrentSubscription = getCurrentSubscription;
