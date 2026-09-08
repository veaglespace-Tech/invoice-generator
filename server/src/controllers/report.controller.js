'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getReports = void 0;

var _server = require('../server');
var _client = require('@prisma/client');

const getReports = async (req, res, next) => {
  try {
    let targetOrgId = req.user?.organization_id;
    if (req.user?.role === _client.Role.SUPER_ADMIN && req.query.organization_id) {
      targetOrgId = req.query.organization_id;
    }

    if (!targetOrgId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const { period, startDate, endDate } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'daily') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { gte: startOfDay, lte: endOfDay };
    } else if (period === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      dateFilter = { gte: startOfMonth, lte: endOfMonth };
    } else if (period === 'yearly') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      dateFilter = { gte: startOfYear, lte: endOfYear };
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    } else {
      // Default to all time if no period specified (or we could default to monthly)
      // Actually let's fetch all if period is 'all'
      if (period !== 'all') {
         const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
         const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
         dateFilter = { gte: startOfMonth, lte: endOfMonth };
      }
    }

    const whereClause = {
      organization_id: targetOrgId,
      is_deleted: false,
      status: {
        not: 'CANCELLED'
      }
    };
    
    if (Object.keys(dateFilter).length > 0) {
       whereClause.invoice_date = dateFilter;
    }

    const invoices = await _server.prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            customer_name: true,
            company_name: true,
          }
        }
      },
      orderBy: {
        invoice_date: 'desc'
      }
    });

    const salesInvoices = invoices.filter(inv => inv.type === 'SALES');
    const purchaseInvoices = invoices.filter(inv => inv.type === 'PURCHASE');

    const totalSales = salesInvoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);
    const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);
    const balance = totalSales - totalPurchases;

    res.status(200).json({
      success: true,
      data: {
        sales: salesInvoices,
        purchases: purchaseInvoices,
        summary: {
          totalSales,
          totalPurchases,
          balance
        }
      }
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    next(error);
  }
};

exports.getReports = getReports;
