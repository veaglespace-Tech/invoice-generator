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
  const handleDownloadReport = () => {
    if (!recentInvoices || recentInvoices.length === 0) {
      toast.error('No data available to download');
      return;
    }
    const headers = ['Invoice ID', 'Client', 'Amount', 'Date', 'Status'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    recentInvoices.forEach((inv) => {
      const row = [
        inv.id,
        `"${inv.client}"`,
        // Escape commas
        `"${inv.amount}"`,
        inv.date,
        inv.status
      ];
      csvRows.push(row.join(','));
    });
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `invoice_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
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
            className="btn btn-outline hover:scale-105 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </button>
          <Link href="/invoices/new">
            <button className="btn btn-primary text-white hover:scale-105 transition-all shadow-md">
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
              className="w-full flex items-center justify-between p-4 rounded-xl border border-base-200 hover:border-primary hover:bg-base-200 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-medium">Create Invoice</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-base-content/50 group-hover:text-primary transition-colors" />
            </Link>
            <Link
              href="/customers"
              className="w-full flex items-center justify-between p-4 rounded-xl border border-base-200 hover:border-success hover:bg-base-200 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-success/10 rounded-lg text-success">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-medium">Manage Customers</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-base-content/50 group-hover:text-success transition-colors" />
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-sm text-left">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th className="text-right">Status</th>
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
                    <tr key={invoice.id} className="hover">
                      <td className="font-medium text-primary">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="hover:underline"
                        >
                          {invoice.id}
                        </Link>
                      </td>
                      <td className="font-medium">{invoice.client}</td>
                      <td>{invoice.amount}</td>
                      <td className="text-base-content/70">{invoice.date}</td>
                      <td className="text-right">
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
