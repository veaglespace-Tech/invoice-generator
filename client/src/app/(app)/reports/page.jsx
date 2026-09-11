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
    expenses: [],
    summary: { totalSales: 0, totalPurchases: 0, totalExpenses: 0, balance: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('all');
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

      const transactions = [
        ...(data.sales || []).map(t => ({ ...t, displayType: 'Sales' })),
        ...(data.purchases || []).map(t => ({ ...t, displayType: 'Purchases' })),
        ...(data.expenses || []).map(t => ({ ...t, displayType: 'Expenses' }))
      ]
      .filter(t => reportType === 'all' || reportType === t.displayType.toLowerCase())
      .sort((a, b) => new Date(b.created_at || b.invoice_date) - new Date(a.created_at || a.invoice_date));

      let totalAmount = 0;
      const exportData = transactions.map((inv, index) => {
        const amount = Number(inv.grand_total) || 0;
        totalAmount += amount;
        return {
          'Sr. No.': index + 1,
          'Date': new Date(inv.invoice_date).toLocaleDateString(),
          'Type': inv.displayType,
          'Invoice Number': inv.invoice_number,
          'Party Name': inv.customer?.company_name || inv.customer?.customer_name || 'N/A',
          'Amount': amount.toFixed(2),
          'Status': inv.status
        };
      });

      if (exportData.length > 0) {
        exportData.push({
          'Sr. No.': '',
          'Date': '',
          'Type': '',
          'Invoice Number': '',
          'Party Name': 'TOTAL',
          'Amount': totalAmount.toFixed(2),
          'Status': ''
        });
        
        const wsTransactions = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');
      }

      // Summary
      const summaryData = [
        { Metric: 'Total Sales', Amount: data.summary.totalSales.toFixed(2) },
        { Metric: 'Total Purchases', Amount: data.summary.totalPurchases.toFixed(2) },
        { Metric: 'Total Expenses', Amount: (data.summary.totalExpenses || 0).toFixed(2) },
        { Metric: 'Net Balance', Amount: data.summary.balance.toFixed(2) }
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

  const allTransactions = [
    ...(data.sales || []).map(t => ({ ...t, displayType: 'Sales' })),
    ...(data.purchases || []).map(t => ({ ...t, displayType: 'Purchases' })),
    ...(data.expenses || []).map(t => ({ ...t, displayType: 'Expenses' }))
  ]
  .filter(t => reportType === 'all' || reportType === t.displayType.toLowerCase())
  .sort((a, b) => new Date(b.created_at || b.invoice_date) - new Date(a.created_at || a.invoice_date));

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
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm text-sm"
          >
            <option value="all">All Types</option>
            <option value="sales">Sales Only</option>
            <option value="purchases">Purchases Only</option>
            <option value="expenses">Expenses Only</option>
          </select>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-1 sm:gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                      Total Sales
                    </p>
                    <p className="text-lg xl:text-xl font-bold text-slate-900 dark:text-white mt-2 truncate">
                      ₹{data.summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
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
                <div className="flex justify-between items-start gap-1 sm:gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                      Total Purchases
                    </p>
                    <p className="text-lg xl:text-xl font-bold text-slate-900 dark:text-white mt-2 truncate">
                      ₹{data.summary.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 shrink-0">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
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
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-1 sm:gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                      Total Expenses
                    </p>
                    <p className="text-lg xl:text-xl font-bold text-slate-900 dark:text-white mt-2 truncate">
                      ₹{(data.summary.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 shrink-0">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    {data.expenses?.length || 0} Expenses
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br ${data.summary.balance >= 0 ? 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20' : 'from-orange-50 to-orange-100/50 dark:from-orange-900/20'} dark:to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110`}></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-1 sm:gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                      Net Balance
                    </p>
                    <p className="text-lg xl:text-xl font-bold text-slate-900 dark:text-white mt-2 truncate">
                      ₹{data.summary.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${data.summary.balance >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400'}`}>
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
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

          <Card>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                Transactions Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">#</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Party Name</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {allTransactions.length > 0 ? (
                      allTransactions.slice(0, 15).map((inv, idx) => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-4 text-center font-medium text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                            {new Date(inv.invoice_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              inv.displayType === 'Sales' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                              inv.displayType === 'Purchases' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                              {inv.displayType}
                            </span>
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
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">No transactions found for this period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {allTransactions.length > 15 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                  Showing 15 of {allTransactions.length} transactions. Export to Excel to see all.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
