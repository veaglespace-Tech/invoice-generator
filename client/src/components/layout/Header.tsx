"use client"
import React, { useEffect, useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface UserProfile {
  name: string;
  organization: {
    name: string;
  };
}

export function Header() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await fetchApi<{ success: boolean; data: UserProfile }>('/auth/me');
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    getProfile();
  }, []);

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div className="flex items-center justify-between h-full pl-16 md:pl-8 pr-8">
        <div className="flex items-center w-96 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search invoices, customers..." 
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <button className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {profile ? profile.name : 'Loading...'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile?.organization?.name || (profile?.role === 'SUPER_ADMIN' ? 'Super Admin' : '')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
