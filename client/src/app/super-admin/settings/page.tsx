"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Settings, Lock, User, Bell } from 'lucide-react';

export default function SuperAdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your super admin account preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {/* Profile Settings */}
        <Card>
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Update your account profile details.</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input type="text" defaultValue="Super Admin" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input type="email" defaultValue="superadmin@invoice.com" disabled className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-500 cursor-not-allowed" />
              </div>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">Save Changes</button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card>
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security & Password</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Update your password to keep your account secure.</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all" />
              </div>
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all" />
              </div>
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">Update Password</button>
          </div>
        </Card>

      </div>
    </div>
  );
}
