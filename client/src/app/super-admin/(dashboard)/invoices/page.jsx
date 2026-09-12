'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, Download, FileText, Loader2, Building2 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { fetchApi, API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/Pagination';
import * as XLSX from 'xlsx';

export default function SuperAdminInvoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      case 'SENT':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'VIEWED':
      case 'GENERATED':
        return 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'OVERDUE':
      case 'CANCELLED':
        return 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'text-slate-600 border-slate-300 bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const handleViewInvoice = (id) => {
    router.push(`/super-admin/invoices/${id}`);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer?.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus =
      statusFilter === 'ALL' || inv.status === statusFilter;
      
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
      } else if (periodFilter === 'YEARLY') {
        matchesPeriod = invDate.getFullYear() === today.getFullYear();
      } else if (periodFilter === 'CUSTOM' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesPeriod = invDate >= start && invDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const handleDownloadReport = async () => {
    try {
      toast.loading('Fetching data for export...', { id: 'export-toast' });
      // Fetch all invoices to bypass pagination limit for download
      const res = await fetchApi('/invoices?limit=10000');
      const allData = res.success ? res.data : invoices;
      
      const filteredForExport = allData.filter((inv) => {
        const matchesSearch =
          inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.customer?.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());
          
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        
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
          } else if (periodFilter === 'YEARLY') {
            matchesPeriod = invDate.getFullYear() === today.getFullYear();
          } else if (periodFilter === 'CUSTOM' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesPeriod = invDate >= start && invDate <= end;
          }
        }
        return matchesSearch && matchesStatus && matchesPeriod;
      });

      if (!filteredForExport || filteredForExport.length === 0) {
        toast.dismiss('export-toast');
        toast.error('No data available to download for selected filters');
        return;
      }

      const exportData = filteredForExport.map((inv) => ({
        'Invoice Number': inv.invoice_number,
        'Organization': inv.organization?.name || 'N/A',
        'Client': inv.customer?.company_name || inv.customer?.customer_name || 'N/A',
        'Amount': Number(inv.grand_total).toFixed(2),
        'Invoice Date': new Date(inv.invoice_date).toLocaleDateString(),
        'Due Date': new Date(inv.due_date).toLocaleDateString(),
        'Status': inv.status
      }));

      // Summary
      let totalAmount = 0;
      filteredForExport.forEach(inv => {
        if (inv.status !== 'CANCELLED') {
          totalAmount += Number(inv.grand_total) || 0;
        }
      });

      exportData.push({
        'Invoice Number': '',
        'Organization': '',
        'Client': 'TOTAL',
        'Amount': totalAmount.toFixed(2),
        'Invoice Date': '',
        'Due Date': '',
        'Status': ''
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      const colWidths = [
        { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, 
        { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'System Invoices');

      const fileName = `System_Invoices_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.dismiss('export-toast');
      toast.success('System Invoices exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.dismiss('export-toast');
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            All System Invoices
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global view of all invoices generated across all organizations.
          </p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice #, client, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto items-center">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none dark:text-white transition-all text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="GENERATED">Generated</option>
                <option value="SENT">Sent</option>
                <option value="VIEWED">Viewed</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div className="relative flex-1 sm:flex-none">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full sm:w-36 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none dark:text-white transition-all text-sm"
              >
                <option value="ALL">All Time</option>
                <option value="DAILY">Today</option>
                <option value="WEEKLY">This Week</option>
                <option value="MONTHLY">This Month</option>
                <option value="YEARLY">This Year</option>
                <option value="CUSTOM">Custom Date</option>
              </select>
            </div>

            {periodFilter === 'CUSTOM' && (
              <div className="flex gap-2 items-center flex-1 sm:flex-none">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm flex-1 sm:flex-none justify-center whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/50">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                    <p>Loading invoices...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <FileText className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="text-lg font-medium text-slate-900 dark:text-white">
                        No invoices found
                      </p>
                      <p className="text-sm">
                        No invoices match your search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {inv.invoice_number}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {inv.organization?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-900 dark:text-slate-300">
                      {inv.customer?.company_name ||
                        inv.customer?.customer_name ||
                        'Unknown Client'}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                      ₹{parseFloat(inv.grand_total).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(inv.status)}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(inv.id)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:text-indigo-400 font-medium"
                      >
                        View / Print
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && (
          <div className="flex flex-col mt-4">
            <div className="p-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
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
    </div>
  );
}
