'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Building2, Users, Receipt, 
  Search, Edit, Trash2, X, Loader2, Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchApi } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function SuperAdminDashboard() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    totalInvoices: 0
  });

  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingOrg, setEditingOrg] = useState(null);
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState('');
  const [additionalMonths, setAdditionalMonths] = useState('');
  const [customMaxInvoices, setCustomMaxInvoices] = useState('');
  const [customMaxCustomers, setCustomMaxCustomers] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = async (page = 1) => {
    try {
      const [orgsRes, plansRes] = await Promise.all([
        fetchApi(`/organizations?page=${page}&limit=10`),
        fetchApi('/plans')
      ]);

      if (orgsRes.success && orgsRes.data) {
        setOrganizations(orgsRes.data);
        
        if (orgsRes.pagination) {
          setTotalPages(orgsRes.pagination.totalPages);
          setTotalItems(orgsRes.pagination.total);
          setCurrentPage(page);
        }
        
        let users = 0;
        let invoices = 0;
        orgsRes.data.forEach((org) => {
          users += org._count?.users || 0;
          invoices += org._count?.invoices || 0;
        });
        
        // Let's preserve totalOrgs logic since we might only get a paginated list now.
        // Use activeTotal for the display count if available, otherwise fallback
        setStats({
          totalOrgs: orgsRes.pagination?.activeTotal || orgsRes.pagination?.total || orgsRes.data.length,
          totalUsers: users,
          totalInvoices: invoices
        });
      }

      if (plansRes.success && plansRes.data) {
        setPlans(plansRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoadingStats(false);
      setLoadingOrgs(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (org) => {
    setEditingOrg(org);
    setNewPlan(org.plan_id || (plans.length > 0 ? plans[0].id : ''));
    setAdditionalMonths('');
    setCustomMaxInvoices(org.custom_max_invoices !== null && org.custom_max_invoices !== undefined ? String(org.custom_max_invoices) : '');
    setCustomMaxCustomers(org.custom_max_customers !== null && org.custom_max_customers !== undefined ? String(org.custom_max_customers) : '');
  };

  const handleSavePlan = async () => {
    if (!editingOrg) return;
    setIsSavingPlan(true);
    try {
      const payload = {
        plan_id: newPlan
      };
      if (additionalMonths) payload.additional_months = Number(additionalMonths);
      if (customMaxInvoices) payload.custom_max_invoices = Number(customMaxInvoices);
      if (customMaxCustomers) payload.custom_max_customers = Number(customMaxCustomers);

      const res = await fetchApi(`/organizations/${editingOrg.id}`, {
        method: 'PUT',
        data: payload
      });
      if (res.success) {
        alert('Plan updated successfully!');
        setEditingOrg(null);
        loadData(); // Refresh the list
      } else {
        alert('Failed to update plan: ' + res.message);
      }
    } catch (err) {
      console.error('Error updating plan', err);
      alert('An error occurred while updating the plan.');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeleteOrg = async (id) => {
    if (window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      try {
        const res = await fetchApi(`/organizations/${id}`, {
          method: 'DELETE'
        });
        if (res.success) {
          toast.success('Organization deleted successfully');
          loadData();
        } else {
          toast.error(res.message || 'Failed to delete organization');
        }
      } catch (err) {
        console.error('Failed to delete organization', err);
        toast.error('An error occurred while deleting the organization');
      }
    }
  };

  const handleDownloadReport = async () => {
    try {
      toast.loading('Fetching data for export...', { id: 'export-toast' });
      // Fetch all organizations bypassing pagination limit
      const res = await fetchApi('/organizations?limit=10000');
      const allData = res.success ? res.data : organizations;

      const filteredForExport = allData.filter(
        (org) =>
          org.name.toLowerCase().includes(search.toLowerCase()) ||
          org.email.toLowerCase().includes(search.toLowerCase())
      );

      if (!filteredForExport || filteredForExport.length === 0) {
        toast.dismiss('export-toast');
        toast.error('No data available to download');
        return;
      }

      let totalUsers = 0;
      let totalInvoices = 0;
      const exportData = filteredForExport.map((org) => {
        totalUsers += org._count?.users || 0;
        totalInvoices += org._count?.invoices || 0;
        return {
          'Organization Name': org.name,
          'Email': org.email,
          'Phone': org.phone || 'N/A',
          'Plan': org.plan?.name || 'None',
          'Users Count': org._count?.users || 0,
          'Invoices Count': org._count?.invoices || 0,
          'Status': org.status,
          'Created At': new Date(org.created_at).toLocaleDateString()
        };
      });

      if (exportData.length > 0) {
        exportData.push({
          'Organization Name': '',
          'Email': '',
          'Phone': '',
          'Plan': 'TOTAL',
          'Users Count': totalUsers,
          'Invoices Count': totalInvoices,
          'Status': '',
          'Created At': ''
        });
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const colWidths = [
        { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Organizations');

      const fileName = `Organizations_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.dismiss('export-toast');
      toast.success('Organizations exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.dismiss('export-toast');
      toast.error('Failed to export data');
    }
  };

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Super Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of system health, metrics, and tenant workspaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">System Status</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Healthy
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Organizations</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {loadingStats ? '...' : stats.totalOrgs}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {loadingStats ? '...' : stats.totalUsers}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Invoices Generated</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {loadingStats ? '...' : stats.totalInvoices}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Manage Organizations
        </h2>
        <Card>
          <div className="p-4 border-b border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm"
              />
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <button
                onClick={handleDownloadReport}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Organization Info</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Plan</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Users</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Invoices</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loadingOrgs ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                    </td>
                  </tr>
                ) : filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white text-sm">
                              {org.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {org.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${org.plan?.name === 'PRO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : org.plan?.name === 'BASIC' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {org.plan?.name || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                        {org._count?.users || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                        {org._count?.invoices || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${org.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : org.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {org.status === 'PAYMENT_PENDING' ? 'Payment Pending' : org.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(org)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Change Plan"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrg(org.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete Organization"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!loadingOrgs && organizations.length > 0 && (
            <div className="flex flex-col mt-4">
              <div className="p-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Showing {filteredOrgs.length} of {totalItems || organizations.length} result(s)</span>
              </div>
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={loadData} 
              />
            </div>
          )}
        </Card>
      </div>

      {/* Edit Plan Modal */}
      {editingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-300 dark:border-slate-700">
              <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
                Change Subscription Plan
              </h2>
              <button
                onClick={() => setEditingOrg(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Organization:{' '}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {editingOrg.name}
                  </span>
                </p>
                <p className="text-sm text-slate-500">
                  Current Plan: {editingOrg.plan?.name || 'None'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select New Plan
                </label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select a plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price}/{plan.interval}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Duration Override (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 12"
                    value={additionalMonths}
                    onChange={(e) => setAdditionalMonths(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Max Invoices (-1 for unlmt)
                  </label>
                  <input
                    type="number"
                    min="-1"
                    placeholder="Leave empty for default"
                    value={customMaxInvoices}
                    onChange={(e) => setCustomMaxInvoices(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Max Customers (-1 for unlmt)
                  </label>
                  <input
                    type="number"
                    min="-1"
                    placeholder="Leave empty for default"
                    value={customMaxCustomers}
                    onChange={(e) => setCustomMaxCustomers(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-300 dark:border-slate-700 flex justify-end gap-3">
              <Button onClick={() => setEditingOrg(null)} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleSavePlan}
                disabled={isSavingPlan || newPlan === editingOrg.plan_id || !newPlan}
                className="gap-2"
              >
                {isSavingPlan && <Loader2 className="w-4 h-4 animate-spin" />}
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
