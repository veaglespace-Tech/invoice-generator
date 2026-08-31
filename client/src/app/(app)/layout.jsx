import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Footer } from '@/components/layout/Footer';
export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-6 md:p-8 flex-1">
              <div className="max-w-7xl mx-auto space-y-6">{children}</div>
            </div>
            <div className="mt-auto">
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
