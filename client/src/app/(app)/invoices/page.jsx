'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Loader2,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/Pagination';
import * as XLSX from 'xlsx';
export default function InvoicesList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetchApi(`/invoices?page=${page}&limit=10`);
      if (response.success) {
        setInvoices(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
          setCurrentPage(page);
        }
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (err) {
      setError(err.message || 'Error loading invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices(1);
  }, []);
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID':
        return 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'PARTIALLY_PAID':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'SENT':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'VIEWED':
        return 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'GENERATED':
        return 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'OVERDUE':
        return 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'CANCELLED':
        return 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'DRAFT':
        return 'text-slate-600 border-slate-300 bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700';
      default:
        return 'text-slate-600 border-slate-300 bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700';
    }
  };
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetchApi(`/invoices/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus
        })
      });
      if (response.success) {
        setInvoices(
          invoices.map((inv) =>
            inv.id === id
              ? {
                  ...inv,
                  status: newStatus
                }
              : inv
          )
        );
        toast.success('Status updated successfully');
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };
  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete this invoice? This action cannot be undone.'
      )
    ) {
      try {
        const response = await fetchApi(`/invoices/${id}`, {
          method: 'DELETE'
        });
        if (response.success) {
          setInvoices(invoices.filter((inv) => inv.id !== id));
          toast.success('Invoice deleted successfully');
        } else {
          toast.error('Failed to delete invoice');
        }
      } catch (err) {
        toast.error(err.message || 'Error deleting invoice');
      }
    }
  };
  const handleDownloadReport = async () => {
    try {
      toast.loading('Fetching data for export...', { id: 'export-toast' });
      const res = await fetchApi('/invoices?limit=10000');
      const allData = res.success ? res.data : invoices;
      
      const filteredForExport = allData.filter((inv) => {
        const matchesSearch =
          inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.customer.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        const matchesType = typeFilter === 'ALL' || inv.type === typeFilter;
        
        let matchesPeriod = true;
        if (periodFilter !== 'ALL') {
          const invDate = new Date(inv.invoice_date);
          const today = new Date();
          
          if (periodFilter === 'DAILY') {
            matchesPeriod = invDate.toDateString() === today.toDateString();
          } else if (periodFilter === 'WEEKLY') {
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            matchesPeriod = invDate >= lastWeek && invDate <= today;
          } else if (periodFilter === 'MONTHLY') {
            matchesPeriod = invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear();
          } else if (periodFilter === 'CUSTOM' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesPeriod = invDate >= start && invDate <= end;
          }
        }

        return matchesSearch && matchesStatus && matchesType && matchesPeriod;
      });

      if (!filteredForExport || filteredForExport.length === 0) {
        toast.dismiss('export-toast');
        toast.error('No data available to download for selected filters');
        return;
      }

      const exportData = filteredForExport.map((inv) => ({
        'Invoice Number': inv.invoice_number,
        'Type': inv.type || 'SALES',
        'Client': inv.customer.company_name || inv.customer.customer_name,
        'Amount': Number(inv.grand_total).toFixed(2),
        'Invoice Date': new Date(inv.invoice_date).toLocaleDateString(),
        'Due Date': new Date(inv.due_date).toLocaleDateString(),
        'Status': inv.status
      }));

      // Calculate totals
      let totalSales = 0;
      let totalPurchases = 0;
      filteredForExport.forEach(inv => {
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
      
      // Add summary rows
      exportData.push({
        'Invoice Number': 'SUMMARY (Excl. Cancelled)',
      });
      exportData.push({
        'Invoice Number': 'Total Sales',
        'Amount': totalSales.toFixed(2)
      });
      exportData.push({
        'Invoice Number': 'Total Purchases',
        'Amount': totalPurchases.toFixed(2)
      });
      exportData.push({
        'Invoice Number': 'Net Balance',
        'Amount': balance.toFixed(2)
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths to prevent ### in Excel
      ws['!cols'] = [
        { wch: 18 }, // Invoice Number
        { wch: 12 }, // Type
        { wch: 30 }, // Client
        { wch: 15 }, // Amount
        { wch: 15 }, // Invoice Date
        { wch: 15 }, // Due Date
        { wch: 15 }  // Status
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
      XLSX.writeFile(wb, `invoices_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.dismiss('export-toast');
      toast.success('Excel downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.dismiss('export-toast');
      toast.error('Failed to download Excel file');
    }
  };
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer.customer_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      inv.customer.company_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || inv.type === typeFilter;
    
    let matchesPeriod = true;
    if (periodFilter !== 'ALL') {
      const invDate = new Date(inv.invoice_date);
      const today = new Date();
      
      if (periodFilter === 'DAILY') {
        matchesPeriod = invDate.toDateString() === today.toDateString();
      } else if (periodFilter === 'WEEKLY') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        matchesPeriod = invDate >= lastWeek && invDate <= today;
      } else if (periodFilter === 'MONTHLY') {
        matchesPeriod = invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear();
      } else if (periodFilter === 'CUSTOM' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesPeriod = invDate >= start && invDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesPeriod;
  });
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Invoices
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage and track your invoices.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadReport}
            className="btn bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <Link
            href="/invoices/new"
            className="btn btn-primary text-white hover:scale-105 transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </Link>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {periodFilter === 'CUSTOM' && (
              <div className="flex items-center gap-2 mr-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input input-sm input-bordered w-32"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input input-sm input-bordered w-32"
                />
              </div>
            )}
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 btn-sm h-10 font-medium">
                <Filter className="w-4 h-4 mr-1" />
                {periodFilter === 'ALL' ? 'All Time' : periodFilter === 'CUSTOM' ? 'Custom Date' : periodFilter.charAt(0) + periodFilter.slice(1).toLowerCase()}
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white dark:bg-slate-800 rounded-box w-40 mt-2 border border-slate-300 dark:border-slate-700">
                <li><a onClick={() => setPeriodFilter('ALL')}>All Time</a></li>
                <li><a onClick={() => setPeriodFilter('DAILY')}>Today</a></li>
                <li><a onClick={() => setPeriodFilter('WEEKLY')}>Last 7 Days</a></li>
                <li><a onClick={() => setPeriodFilter('MONTHLY')}>This Month</a></li>
                <li><a onClick={() => setPeriodFilter('CUSTOM')}>Custom Date</a></li>
              </ul>
            </div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 btn-sm h-10 font-medium">
                <Filter className="w-4 h-4 mr-1" />
                {typeFilter === 'ALL' ? 'All Types' : typeFilter === 'SALES' ? 'Sales' : 'Purchase'}
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white dark:bg-slate-800 rounded-box w-40 mt-2 border border-slate-300 dark:border-slate-700">
                <li><a onClick={() => setTypeFilter('ALL')}>All Types</a></li>
                <li><a onClick={() => setTypeFilter('SALES')}>Sales</a></li>
                <li><a onClick={() => setTypeFilter('PURCHASE')}>Purchase</a></li>
              </ul>
            </div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 btn-sm h-10 font-medium">
                <Filter className="w-4 h-4 mr-1" />
                {statusFilter === 'ALL' ? 'All Status' : statusFilter}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-white dark:bg-slate-800 rounded-box w-40 mt-2 border border-slate-300 dark:border-slate-700"
              >
                <li>
                  <a onClick={() => setStatusFilter('ALL')}>All Status</a>
                </li>
                <li>
                  <a onClick={() => setStatusFilter('DRAFT')}>Draft</a>
                </li>
                <li>
                  <a onClick={() => setStatusFilter('GENERATED')}>Generated</a>
                </li>
                <li>
                  <a onClick={() => setStatusFilter('SENT')}>Sent</a>
                </li>
                <li>
                  <a onClick={() => setStatusFilter('PAID')}>Paid</a>
                </li>
                <li>
                  <a onClick={() => setStatusFilter('CANCELLED')}>Cancelled</a>
                </li>
              </ul>
            </div>
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
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <p>No invoices found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Invoice Number</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-3 px-4">
                      {invoice.type === 'PURCHASE' ? (
                        <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-1 rounded-md text-xs font-semibold uppercase">Purchase</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-md text-xs font-semibold uppercase">Sales</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {invoice.customer.company_name ||
                        invoice.customer.customer_name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      ₹{Number(invoice.grand_total).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={invoice.status}
                        onChange={(e) =>
                          handleStatusChange(invoice.id, e.target.value)
                        }
                        className={`select select-sm border outline-none font-medium min-w-[130px] ${getStatusBadgeClass(invoice.status)}`}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="GENERATED">Generated</option>
                        <option value="SENT">Sent</option>
                        <option value="PAID">Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost btn-sm btn-square text-slate-700 dark:text-slate-300"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[10] menu p-2 shadow bg-white dark:bg-slate-800 rounded-box w-36 border border-slate-300 dark:border-slate-700"
                        >
                          <li>
                            <Link href={`/invoices/${invoice.id}`}>
                              View Details
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && (
          <div className="flex flex-col mt-4">
            <div className="p-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Showing {filteredInvoices.length} of {totalItems || invoices.length} result(s)</span>
            </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={loadInvoices} 
            />
          </div>
        )}
      </Card>
    </>
  );
}
