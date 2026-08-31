'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Building2, Users, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { fetchApi } from '@/lib/api';
export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    totalInvoices: 0
  });
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchApi('/organizations');
        if (res.success && res.data) {
          let users = 0;
          let invoices = 0;
          res.data.forEach((org) => {
            users += org._count?.users || 0;
            invoices += org._count?.invoices || 0;
          });
          setStats({
            totalOrgs: res.data.length,
            totalUsers: users,
            totalInvoices: invoices
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Super Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of system health and metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                System Status
              </p>
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
              <p className="text-sm font-medium text-slate-500">
                Total Organizations
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? '...' : stats.totalOrgs}
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
              <p className="text-sm font-medium text-slate-500">
                Total Logins/Users
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? '...' : stats.totalUsers}
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
              <p className="text-sm font-medium text-slate-500">
                Invoices Generated
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? '...' : stats.totalInvoices}
              </h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
