"use client";

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Building2, Search, MoreHorizontal, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface OrgStats {
  _count?: {
    users: number;
    customers: number;
    invoices: number;
  };
}

interface Organization extends OrgStats {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
  plan: 'FREE' | 'BASIC' | 'PRO';
  created_at: string;
}

export default function SuperAdminOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [newPlan, setNewPlan] = useState<'FREE' | 'BASIC' | 'PRO'>('FREE');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const loadOrganizations = async () => {
    try {
      const res = await fetchApi<{ success: boolean; data: Organization[] }>('/organizations');
      if (res.success && res.data) {
        setOrganizations(res.data);
      }
    } catch (err) {
      console.error("Failed to load organizations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleEditClick = (org: Organization) => {
    setEditingOrg(org);
    setNewPlan(org.plan);
  };

  const handleSavePlan = async () => {
    if (!editingOrg) return;
    setIsSavingPlan(true);
    try {
      const res = await fetchApi<{ success: boolean; message: string }>(`/organizations/${editingOrg.id}`, {
        method: 'PUT',
        data: { plan: newPlan }
      });

      if (res.success) {
        alert("Plan updated successfully!");
        setEditingOrg(null);
        loadOrganizations(); // Refresh the list
      } else {
        alert("Failed to update plan: " + res.message);
      }
    } catch (err) {
      console.error("Error updating plan", err);
      alert("An error occurred while updating the plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(search.toLowerCase()) || 
    org.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organizations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all tenant workspaces and their subscriptions.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search organizations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Organization Info</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Plan</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Users</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Invoices</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Loading organizations...</td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No organizations found.</td>
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
                          <div className="font-medium text-slate-900 dark:text-white text-sm">{org.name}</div>
                          <div className="text-xs text-slate-500">{org.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        org.plan === 'PRO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        org.plan === 'BASIC' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {org._count?.users || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {org._count?.invoices || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        org.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(org)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Change Plan">
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

      {/* Edit Plan Modal */}
      {editingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold text-lg text-slate-900 dark:text-white">Change Subscription Plan</h2>
              <button onClick={() => setEditingOrg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Organization: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{editingOrg.name}</span></p>
                <p className="text-sm text-slate-500">Current Plan: {editingOrg.plan}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select New Plan</label>
                <select 
                  value={newPlan} 
                  onChange={(e) => setNewPlan(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="FREE">FREE - Base tier</option>
                  <option value="BASIC">BASIC - Starter features</option>
                  <option value="PRO">PRO - Advanced features</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button onClick={() => setEditingOrg(null)} variant="outline">Cancel</Button>
              <Button onClick={handleSavePlan} disabled={isSavingPlan || newPlan === editingOrg.plan} className="gap-2">
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
