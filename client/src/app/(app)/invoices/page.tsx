"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: {
    customer_name: string;
    company_name: string;
  };
  grand_total: number;
  invoice_date: string;
  due_date: string;
  status: string;
}

export default function InvoicesList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const response = await fetchApi<{ success: boolean; data: Invoice[] }>('/invoices');
        if (response.success) {
          setInvoices(response.data);
        } else {
          setError('Failed to fetch invoices');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading invoices');
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge variant="success">Paid</Badge>;
      case 'PENDING': return <Badge variant="warning">Pending</Badge>;
      case 'OVERDUE': return <Badge variant="danger">Overdue</Badge>;
      case 'DRAFT': return <Badge variant="default">Draft</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this invoice? This action cannot be undone.')) {
      try {
        const response = await fetchApi<{ success: boolean; message: string }>(`/invoices/${id}`, {
          method: 'DELETE'
        });
        if (response.success) {
          setInvoices(invoices.filter(inv => inv.id !== id));
        } else {
          alert('Failed to delete invoice');
        }
      } catch (err: any) {
        alert(err.message || 'Error deleting invoice');
      }
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your invoices.</p>
        </div>
        <Link href="/invoices/new" className="btn btn-primary text-white hover:scale-105 transition-all shadow-md flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Invoice
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="input input-bordered w-full pl-10"
            />
          </div>
          <button className="btn btn-outline">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
              <p>Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-red-500">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 hover:underline">Try again</button>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <p>No invoices found.</p>
            </div>
          ) : (
            <table className="table table-zebra w-full text-sm text-left">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    className="hover cursor-pointer"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <td className="font-medium text-primary">
                      {invoice.invoice_number}
                    </td>
                    <td className="font-medium text-base-content">{invoice.customer.company_name || invoice.customer.customer_name}</td>
                    <td className="font-semibold text-base-content">₹{Number(invoice.grand_total).toLocaleString()}</td>
                    <td className="text-base-content/70">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td className="text-base-content/70">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td>
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square">
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow bg-white dark:bg-slate-800 rounded-box w-36 border border-slate-200 dark:border-slate-700">
                          <li><Link href={`/invoices/${invoice.id}`}>View Details</Link></li>
                          <li><button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && !error && invoices.length > 0 && (
          <div className="p-4 border-t border-base-200 flex items-center justify-between text-sm text-base-content/70">
            <span>Showing {invoices.length} result(s)</span>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" disabled>Previous</button>
              <button className="btn btn-outline btn-sm" disabled>Next</button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
