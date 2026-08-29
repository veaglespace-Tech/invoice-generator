"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Loader2, Download } from 'lucide-react';
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

import { toast } from 'sonner';

export default function InvoicesList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'PARTIALLY_PAID': return 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'SENT': return 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'VIEWED': return 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'GENERATED': return 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'OVERDUE': return 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'CANCELLED': return 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'DRAFT': return 'text-slate-600 border-slate-200 bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700';
      default: return 'text-slate-600 border-slate-200 bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetchApi<{ success: boolean; message: string }>(`/invoices/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (response.success) {
        setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
        toast.success('Status updated successfully');
      } else {
        toast.error('Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
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
          toast.success('Invoice deleted successfully');
        } else {
          toast.error('Failed to delete invoice');
        }
      } catch (err: any) {
        toast.error(err.message || 'Error deleting invoice');
      }
    }
  };

  const handleDownloadReport = () => {
    if (!filteredInvoices || filteredInvoices.length === 0) {
      toast.error('No data available to download');
      return;
    }
    const headers = ['Invoice Number', 'Client', 'Amount', 'Invoice Date', 'Due Date', 'Status'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    filteredInvoices.forEach(inv => {
      const clientName = inv.customer.company_name || inv.customer.customer_name;
      const row = [
        inv.invoice_number,
        `"${clientName}"`,
        `"${inv.grand_total}"`,
        new Date(inv.invoice_date).toLocaleDateString(),
        new Date(inv.due_date).toLocaleDateString(),
        inv.status
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Invoices downloaded successfully');
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customer.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your invoices.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownloadReport} className="btn btn-outline hover:scale-105 transition-all shadow-sm flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <Link href="/invoices/new" className="btn btn-primary text-white hover:scale-105 transition-all shadow-md flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Invoice
          </Link>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-outline">
              <Filter className="w-4 h-4" />
              {statusFilter === 'ALL' ? 'All Status' : statusFilter}
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white dark:bg-slate-800 rounded-box w-52 mt-2 border border-slate-200 dark:border-slate-700">
              <li><a onClick={() => setStatusFilter('ALL')}>All</a></li>
              <li><a onClick={() => setStatusFilter('DRAFT')}>Draft</a></li>
              <li><a onClick={() => setStatusFilter('GENERATED')}>Generated</a></li>
              <li><a onClick={() => setStatusFilter('SENT')}>Sent</a></li>
              <li><a onClick={() => setStatusFilter('PAID')}>Paid</a></li>
              <li><a onClick={() => setStatusFilter('CANCELLED')}>Cancelled</a></li>
            </ul>
          </div>
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
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <p>No invoices found matching your criteria.</p>
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
                {filteredInvoices.map((invoice) => (
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
                    <td onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className={`select select-sm border outline-none font-medium ${getStatusBadgeClass(invoice.status)}`}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="GENERATED">Generated</option>
                        <option value="SENT">Sent</option>
                        <option value="PAID">Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
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
            <span>Showing {filteredInvoices.length} result(s)</span>
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
