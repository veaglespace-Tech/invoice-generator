import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Super Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of system health and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">System Status</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Healthy</h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
