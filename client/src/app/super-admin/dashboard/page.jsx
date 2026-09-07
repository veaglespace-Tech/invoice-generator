'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Building2, Users, Receipt, 
  Search, Edit, Trash2, X, Loader2 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchApi } from '@/lib/api';

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

  const loadData = async () => {
    try {
      const [orgsRes, plansRes] = await Promise.all([
        fetchApi('/organizations'),
        fetchApi('/plans')
      ]);

      if (orgsRes.success && orgsRes.data) {
        setOrganizations(orgsRes.data);
        
        let users = 0;
        let invoices = 0;
        orgsRes.data.forEach((org) => {
          users += org._count?.users || 0;
          invoices += org._count?.invoices || 0;
        });
        
        setStats({
          totalOrgs: orgsRes.data.length,
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
          <div className="p-4 border-b border-slate-300 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
              />
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${org.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {org.status}
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
                          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
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
