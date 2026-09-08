'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Users,
  FileText,
  CheckCircle2,
  Loader2,
  Download
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const response = await fetchApi('/dashboard/org');
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getDashboardData();
  }, []);
  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"
            ></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl mt-6"></div>
      </div>
    );
  }
  const { cards, recentInvoices } = data;
  const handleDownloadReport = async () => {
    try {
      toast.loading('Fetching full data for export...', { id: 'export-toast' });
      const res = await fetchApi('/invoices?limit=10000');
      
      if (!res.success || !res.data || res.data.length === 0) {
        toast.dismiss('export-toast');
        toast.error('No data available to download');
        return;
      }
      
      const allInvoices = res.data;

      const exportData = allInvoices.map((inv) => ({
        'Invoice Number': inv.invoice_number,
        'Type': inv.type || 'SALES',
        'Client': inv.customer?.company_name || inv.customer?.customer_name || 'N/A',
        'Amount': Number(inv.grand_total).toFixed(2),
        'Invoice Date': new Date(inv.invoice_date).toLocaleDateString(),
        'Due Date': new Date(inv.due_date).toLocaleDateString(),
        'Status': inv.status
      }));

      // Calculate totals
      let totalSales = 0;
      let totalPurchases = 0;
      allInvoices.forEach(inv => {
        if (inv.status !== 'CANCELLED') {
          const amount = Number(inv.grand_total) || 0;
          if (inv.type === 'PURCHASE') {
            totalPurchases += amount;
          } else {
            totalSales += amount;
          }
        }
      });
      
      const balance = totalSales - totalPurchases;

      // Add space before summary
      exportData.push({});
      exportData.push({});
      exportData.push({ 'Invoice Number': 'SUMMARY (Excl. Cancelled)' });
      exportData.push({ 'Invoice Number': 'Total Sales', 'Amount': totalSales.toFixed(2) });
      exportData.push({ 'Invoice Number': 'Total Purchases', 'Amount': totalPurchases.toFixed(2) });
      exportData.push({ 'Invoice Number': 'Net Balance', 'Amount': balance.toFixed(2) });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      ws['!cols'] = [
        { wch: 18 }, // Invoice Number
        { wch: 12 }, // Type
        { wch: 30 }, // Client
        { wch: 15 }, // Amount
        { wch: 15 }, // Invoice Date
        { wch: 15 }, // Due Date
        { wch: 15 }  // Status
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'All_Invoices');
      XLSX.writeFile(wb, `full_business_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.dismiss('export-toast');
      toast.success('Full report downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.dismiss('export-toast');
      toast.error('Failed to download Excel file');
    }
  };
  const stats = [
    {
      name: 'Total Revenue',
      value: `₹${cards.totalPaidAmount.toLocaleString('en-IN')}`,
      change: '0.0%',
      trend: 'up',
      icon: IndianRupee
    },
    {
      name: 'Outstanding',
      value: `₹${cards.totalPendingAmount.toLocaleString('en-IN')}`,
      change: '0.0%',
      trend: 'up',
      icon: FileText
    },
    {
      name: 'Paid Invoices',
      value: cards.totalPaidInvoices?.toString() || '0',
      change: '0.0%',
      trend: 'up',
      icon: CheckCircle2
    },
    {
      name: 'Total Customers',
      value: cards.totalCustomers.toString(),
      change: '0.0%',
      trend: 'up',
      icon: Users
    }
  ];
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadReport}
            className="btn bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          <Link href="/invoices/new">
            <button className="btn btn-primary text-white hover:scale-105 transition-all shadow-md whitespace-nowrap flex items-center gap-2">
              Create Invoice
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span
                  className={`flex items-center font-medium ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    {
                      name: 'Jan',
                      revenue: 4000
                    },
                    {
                      name: 'Feb',
                      revenue: 3000
                    },
                    {
                      name: 'Mar',
                      revenue: 5000
                    },
                    {
                      name: 'Apr',
                      revenue: 4500
                    },
                    {
                      name: 'May',
                      revenue: 6000
                    },
                    {
                      name: 'Jun',
                      revenue: cards.totalPaidAmount || 7000
                    }
                  ]}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }}
                    dx={-10}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="/invoices/new"
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-100 dark:bg-slate-800/50 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-medium">Create Invoice</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
            </Link>
            <Link
              href="/customers"
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-success hover:bg-slate-100 dark:bg-slate-800/50 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-success/10 rounded-lg text-success">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-medium">Manage Customers</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-success transition-colors" />
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Invoice ID</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      No invoices found. Create your first invoice!
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice, index) => (
                    <tr key={invoice.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="hover:underline"
                        >
                          {invoice.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{invoice.client}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{invoice.amount}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{invoice.date}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant={
                            invoice.status === 'Paid'
                              ? 'success'
                              : invoice.status === 'Pending' ||
                                  invoice.status === 'Sent'
                                ? 'warning'
                                : invoice.status === 'Overdue'
                                  ? 'danger'
                                  : 'default'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
