"use client";

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Loader2, Users, IndianRupee, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface Organization {
  id: string;
  name: string;
  email: string;
  plan: 'FREE' | 'BASIC' | 'PRO';
  status: string;
  created_at: string;
}

export default function PlansPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const res = await fetchApi<{ success: boolean; data: Organization[] }>('/organizations?limit=100');
      if (res.success && res.data) {
        setOrganizations(res.data);
      }
    } catch (error) {
      console.error("Failed to load organizations", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'PRO':
        return 'success';
      case 'BASIC':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handlePlanChange = async (orgId: string, newPlan: string) => {
    try {
      // Optimistic update
      setOrganizations(orgs => orgs.map(o => o.id === orgId ? { ...o, plan: newPlan as any } : o));
      
      const res = await fetchApi(`/organizations/${orgId}`, {
        method: 'PUT',
        data: { plan: newPlan }
      });
      
      if (!res.success) {
        loadOrganizations(); // Revert on failure
      }
    } catch (error) {
      console.error("Failed to update plan", error);
      loadOrganizations();
    }
  };

  const stats = {
    total: organizations.length,
    free: organizations.filter(o => o.plan === 'FREE').length,
    basic: organizations.filter(o => o.plan === 'BASIC').length,
    pro: organizations.filter(o => o.plan === 'PRO').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Plans & Subscriptions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of organization subscriptions and revenue.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Organizations</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</h3>
              </div>
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pro Subscriptions</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.pro}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Basic Subscriptions</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.basic}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-none shadow-lg shadow-indigo-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-100">Estimated MRR</p>
                <h3 className="text-2xl font-bold text-white mt-1">₹ {stats.pro * 1999 + stats.basic * 999}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription List */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <CardTitle>Organization Plans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Organization</th>
                  <th className="px-6 py-4 font-semibold">Current Plan</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{org.name}</div>
                      <div className="text-xs text-slate-500">{org.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={org.plan}
                        onChange={(e) => handlePlanChange(org.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 border outline-none cursor-pointer transition-colors ${
                          org.plan === 'PRO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20' :
                          org.plan === 'BASIC' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/20' :
                          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <option value="FREE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">FREE</option>
                        <option value="BASIC" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">BASIC</option>
                        <option value="PRO" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">PRO</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={org.status === 'ACTIVE' ? 'success' : 'error'}>{org.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {organizations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No organizations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
