'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getSuperAdminDashboard = exports.getOrganizationDashboard = void 0;
var _express = require('express');
var _server = require('../server');
var _client = require('@prisma/client');
const getSuperAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      totalUsers,
      totalCustomers,
      totalInvoices,
      invoices
    ] = await Promise.all([
      _server.prisma.organization.count(),
      _server.prisma.organization.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      _server.prisma.organization.count({
        where: {
          status: 'SUSPENDED'
        }
      }),
      _server.prisma.user.count(),
      _server.prisma.customer.count(),
      _server.prisma.invoice.count(),
      _server.prisma.invoice.findMany({
        select: {
          status: true,
          grand_total: true,
          type: true
        }
      })
    ]);
    let totalInvoiceValue = 0;
    let totalPaidAmount = 0;
    let totalPendingAmount = 0;
    let totalOverdueAmount = 0;
    invoices.forEach((inv) => {
      if (inv.type !== 'SALES') return;
      const amount = Number(inv.grand_total);
      totalInvoiceValue += amount;
      if (inv.status === 'PAID') {
        totalPaidAmount += amount;
      } else if (inv.status === 'OVERDUE') {
        totalOverdueAmount += amount;
      } else if (inv.status !== 'CANCELLED') {
        totalPendingAmount += amount;
      }
    });
    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalOrganizations,
          activeOrganizations,
          suspendedOrganizations,
          totalUsers,
          totalCustomers,
          totalInvoices,
          totalInvoiceValue,
          totalPaidAmount,
          totalPendingAmount,
          totalOverdueAmount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.getSuperAdminDashboard = getSuperAdminDashboard;
const getOrganizationDashboard = async (req, res, next) => {
  try {
    const organization_id = req.user?.organization_id;
    if (!organization_id) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID missing'
      });
    }
    const [totalCustomers, totalInvoices, invoices] = await Promise.all([
      _server.prisma.customer.count({
        where: {
          organization_id
        }
      }),
      _server.prisma.invoice.count({
        where: {
          organization_id
        }
      }),
      _server.prisma.invoice.findMany({
        where: {
          organization_id
        },
        select: {
          status: true,
          grand_total: true,
          created_at: true,
          type: true
        }
      })
    ]);
    let totalInvoiceValue = 0;
    let totalPaidAmount = 0;
    let totalPendingAmount = 0;
    let totalPaidInvoices = 0;
    let totalExpenseAmount = 0;
    
    invoices.forEach((inv) => {
      const amount = Number(inv.grand_total);
      if (inv.type === 'EXPENSE') {
        if (inv.status !== 'CANCELLED') {
          totalExpenseAmount += amount;
        }
      } else {
        totalInvoiceValue += amount;
        if (inv.status === 'PAID') {
          totalPaidAmount += amount;
          totalPaidInvoices += 1;
        } else if (inv.status !== 'CANCELLED' && inv.status !== 'DRAFT') {
          totalPendingAmount += amount;
        }
      }
    });
    const recentSalesRaw = await _server.prisma.invoice.findMany({
      where: {
        organization_id,
        type: 'SALES'
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 4,
      include: {
        customer: true
      }
    });
    
    const recentExpensesRaw = await _server.prisma.invoice.findMany({
      where: {
        organization_id,
        type: 'EXPENSE'
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 4,
      include: {
        customer: true
      }
    });
    
    const formatInvoice = (inv) => ({
      id: inv.invoice_number,
      client: inv.customer?.customer_name || 'Unknown',
      amount: `₹${Number(inv.grand_total).toLocaleString('en-IN')}`,
      status:
        inv.status.charAt(0).toUpperCase() +
        inv.status.slice(1).toLowerCase().replace('_', ' '),
      date: new Date(inv.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    });

    const recentInvoices = recentSalesRaw.map(formatInvoice);
    const recentExpenses = recentExpensesRaw.map(formatInvoice);
    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalCustomers,
          totalInvoices,
          totalPaidInvoices,
          totalInvoiceValue,
          totalPaidAmount,
          totalPendingAmount,
          totalExpenseAmount
        },
        recentInvoices,
        recentExpenses
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.getOrganizationDashboard = getOrganizationDashboard;
