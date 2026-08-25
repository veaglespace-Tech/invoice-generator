import React from 'react';
import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireSuperAdmin={true}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
