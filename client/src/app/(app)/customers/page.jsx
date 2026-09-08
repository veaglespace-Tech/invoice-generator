'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Loader2,
  X,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/Pagination';
import * as XLSX from 'xlsx';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
    billing_address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    GSTIN: '',
    PAN: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetchApi(`/customers?page=${page}&limit=10`);
      setCustomers(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
        setCurrentPage(page);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(1);
  }, []);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    try {
      await fetchApi('/customers', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      await loadCustomers();
      setIsAddModalOpen(false);
      setFormData({
        customer_name: '',
        company_name: '',
        email: '',
        phone: '',
        billing_address: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        GSTIN: '',
        PAN: ''
      });
      toast.success('Customer added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to add customer');
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };
  const handleEditCustomer = async (e) => {
    e.preventDefault();
    if (!editingCustomer || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    try {
      await fetchApi(`/customers/${editingCustomer.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      await loadCustomers();
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      toast.success('Customer updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update customer');
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };
  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name || '',
      company_name: customer.company_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      // Note: Full details might need to be fetched, but we'll use what we have or empty strings
      billing_address: customer.billing_address || '',
      city: customer.city || '',
      state: customer.state || '',
      country: customer.country || '',
      pincode: customer.pincode || '',
      GSTIN: customer.GSTIN || '',
      PAN: customer.PAN || ''
    });
    setIsEditModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetchApi(`/customers/${id}`, {
          method: 'DELETE'
        });
        if (response.success) {
          setCustomers(customers.filter((c) => c.id !== id));
          toast.success('Customer deleted successfully');
        } else {
          toast.error('Failed to delete customer');
        }
      } catch (err) {
        toast.error(err.message || 'Error deleting customer');
      }
    }
  };

  const handleDownloadReport = async () => {
    try {
      toast.loading('Fetching data for export...', { id: 'export-toast' });
      const res = await fetchApi('/customers?limit=10000');
      const allData = res.success ? res.data : customers;
      
      const filteredForExport = allData.filter((c) => {
        return c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               c.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
      });

      if (!filteredForExport || filteredForExport.length === 0) {
        toast.dismiss('export-toast');
        toast.error('No data available to download for selected filters');
        return;
      }

      const exportData = filteredForExport.map((c) => ({
        'Customer Name': c.customer_name,
        'Company Name': c.company_name || 'N/A',
        'Email': c.email || 'N/A',
        'Phone': c.phone || 'N/A',
        'City': c.city || 'N/A',
        'State': c.state || 'N/A',
        'GSTIN': c.GSTIN || 'N/A'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      ws['!cols'] = [
        { wch: 30 }, // Customer Name
        { wch: 30 }, // Company Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // City
        { wch: 15 }, // State
        { wch: 20 }  // GSTIN
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Customers');
      XLSX.writeFile(wb, `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.dismiss('export-toast');
      toast.success('Excel downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.dismiss('export-toast');
      toast.error('Failed to download Excel file');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Customers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Add new and existing customers.
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary text-white hover:scale-105 transition-all shadow-md whitespace-nowrap flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search customers by name or company..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <p>Loading customers...</p>
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
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <p>No customers found matching search.</p>
            </div>
          ) : (
            <table className="table w-full text-sm text-left">
              <thead className="text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th>Customer Details</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-700">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                          {customer.customer_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {customer.customer_name}
                          </p>
                          {customer.company_name && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3" />{' '}
                              {customer.company_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />{' '}
                          {customer.email || 'N/A'}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-xs">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />{' '}
                          {customer.phone || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td>
                      {customer.status === 'ACTIVE' ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="default">Inactive</Badge>
                      )}
                    </td>
                    <td className="text-right">
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
                            <a onClick={() => openEditModal(customer)}>Edit</a>
                          </li>
                          <li>
                            <button
                              onClick={() => handleDelete(customer.id)}
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
            <div className="p-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Showing {customers.length} of {totalItems || customers.length} result(s)</span>
            </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={loadCustomers} 
            />
          </div>
        )}
      </Card>

      {/* Customer Modal (Add/Edit) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditModalOpen ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingCustomer(null);
                  setFormData({
                    customer_name: '',
                    company_name: '',
                    email: '',
                    phone: '',
                    billing_address: '',
                    city: '',
                    state: '',
                    country: '',
                    pincode: '',
                    GSTIN: '',
                    PAN: ''
                  });
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto">
              <form
                id="customer-form"
                onSubmit={
                  isEditModalOpen ? handleEditCustomer : handleAddCustomer
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                  }
                }}
                className="p-6 space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Basic Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Customer Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customer_name: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company_name: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Billing Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.billing_address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            billing_address: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                        placeholder="123 Business Park..."
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            city: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            state: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Pincode / ZIP
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pincode: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            country: e.target.value
                          })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Tax & Legal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        GSTIN (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.GSTIN}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            GSTIN: e.target.value
                          })
                        }
                        className="input input-bordered w-full uppercase"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        PAN (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.PAN}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            PAN: e.target.value
                          })
                        }
                        className="input input-bordered w-full uppercase"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingCustomer(null);
                  setFormData({
                    customer_name: '',
                    company_name: '',
                    email: '',
                    phone: '',
                    billing_address: '',
                    city: '',
                    state: '',
                    country: '',
                    pincode: '',
                    GSTIN: '',
                    PAN: ''
                  });
                }}
                  className="btn btn-ghost text-slate-700 dark:text-slate-300"
                >
                  Cancel
              </button>
              <button
                form="customer-form"
                type="submit"
                disabled={submitting}
                className="btn btn-primary text-white"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting
                  ? 'Saving...'
                  : isEditModalOpen
                    ? 'Update Customer'
                    : 'Save Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
