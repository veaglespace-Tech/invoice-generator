'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart3, TrendingUp, TrendingDown, Calendar, FileSpreadsheet, Download, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [data, setData] = useState({
    sales: [],
    purchases: [],
    summary: { totalSales: 0, totalPurchases: 0, balance: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      let url = `/reports?period=${period}`;
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetchApi(url);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error('Failed to load reports');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== 'custom' || (startDate && endDate)) {
      loadReports();
    }
  }, [period, startDate, endDate]);

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Format Sales Data
      const salesData = data.sales.map((inv) => ({
        'Date': new Date(inv.invoice_date).toLocaleDateString(),
        'Invoice Number': inv.invoice_number,
        'Customer': inv.customer?.company_name || inv.customer?.customer_name || 'N/A',
        'Amount': Number(inv.grand_total).toFixed(2),
        'Status': inv.status
      }));
      const wsSales = XLSX.utils.json_to_sheet(salesData);
      XLSX.utils.book_append_sheet(wb, wsSales, 'Sales');

      // Format Purchase Data
      const purchaseData = data.purchases.map((inv) => ({
        'Date': new Date(inv.invoice_date).toLocaleDateString(),
        'Invoice Number': inv.invoice_number,
        'Vendor': inv.customer?.company_name || inv.customer?.customer_name || 'N/A',
        'Amount': Number(inv.grand_total).toFixed(2),
        'Status': inv.status
      }));
      const wsPurchases = XLSX.utils.json_to_sheet(purchaseData);
      XLSX.utils.book_append_sheet(wb, wsPurchases, 'Purchases');

      // Summary
      const summaryData = [
        { Metric: 'Total Sales', Amount: data.summary.totalSales.toFixed(2) },
        { Metric: 'Total Purchases', Amount: data.summary.totalPurchases.toFixed(2) },
        { Metric: 'Balance', Amount: data.summary.balance.toFixed(2) }
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      XLSX.writeFile(wb, `Business_Report_${period}_${new Date().getTime()}.xlsx`);
      toast.success('Excel report downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate Excel file');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Financial Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your sales, purchases, and balance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm text-sm"
          >
            <option value="daily">Today</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 shadow-sm"
              />
              <span className="text-slate-400 font-medium">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 shadow-sm"
              />
            </div>
          )}
          <button
            onClick={loadReports}
            className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          <button
            onClick={exportToExcel}
            className="btn btn-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm font-medium text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Sales
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      ₹{data.summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {data.sales.length} Invoices
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Purchases
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      ₹{data.summary.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    {data.purchases.length} Invoices
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br ${data.summary.balance >= 0 ? 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20' : 'from-orange-50 to-orange-100/50 dark:from-orange-900/20'} dark:to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110`}></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Net Balance
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      ₹{data.summary.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${data.summary.balance >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400'}`}>
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`font-medium ${data.summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {data.summary.balance >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-6 px-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  Sales Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.sales.length > 0 ? (
                        data.sales.slice(0, 5).map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                              {new Date(inv.invoice_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                              {inv.customer?.company_name || inv.customer?.customer_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                              ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-8 text-center text-slate-500 font-medium">No sales recorded for this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {data.sales.length > 5 && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                    Showing 5 of {data.sales.length} transactions. Export to Excel to see all.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-6 px-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  Purchases Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Vendor</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.purchases.length > 0 ? (
                        data.purchases.slice(0, 5).map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                              {new Date(inv.invoice_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                              {inv.customer?.company_name || inv.customer?.customer_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                              ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-8 text-center text-slate-500 font-medium">No purchases recorded for this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {data.purchases.length > 5 && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                    Showing 5 of {data.purchases.length} transactions. Export to Excel to see all.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
