"use client"
import React, { useEffect, useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface UserProfile {
  name: string;
  role?: string;
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
    
    window.addEventListener('profileUpdated', getProfile);
    return () => window.removeEventListener('profileUpdated', getProfile);
  }, []);

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div className="flex items-center justify-end h-full pl-16 md:pl-8 pr-4 md:pr-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer p-1.5 md:pr-4 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden">
              {(profile as any)?.avatar ? (
                <img src={(profile as any).avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
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
