"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Users, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface DashboardData {
  cards: {
    totalCustomers: number;
    totalInvoices: number;
    totalInvoiceValue: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
  };
  recentInvoices: {
    id: string;
    client: string;
    amount: string;
    status: string;
    date: string;
  }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const response = await fetchApi<{ success: boolean; data: DashboardData }>('/dashboard/org');
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  const { cards, recentInvoices } = data;

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
      value: cards.totalInvoices.toString(), // Ideally count of paid, but we use total for now
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
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline hover:scale-105 transition-all shadow-sm">
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
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`flex items-center font-medium ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {stat.change}
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
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
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No invoices found. Create your first invoice!
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice, index) => (
                    <tr key={invoice.id} className="hover">
                      <td className="font-medium text-primary">
                        <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                          {invoice.id}
                        </Link>
                      </td>
                      <td className="font-medium">{invoice.client}</td>
                      <td>{invoice.amount}</td>
                      <td className="text-base-content/70">{invoice.date}</td>
                      <td className="text-right">
                        <Badge variant={
                          invoice.status === 'Paid' ? 'success' : 
                          invoice.status === 'Pending' || invoice.status === 'Sent' ? 'warning' : 
                          invoice.status === 'Overdue' ? 'danger' :
                          'default'
                        }>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/invoices/new" className="w-full flex items-center justify-between p-4 rounded-xl border border-base-200 hover:border-primary hover:bg-base-200 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-medium">Create Invoice</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-base-content/50 group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/customers" className="w-full flex items-center justify-between p-4 rounded-xl border border-base-200 hover:border-success hover:bg-base-200 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1">
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
      </div>
    </>
  );
}
