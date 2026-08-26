"use client";

import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  CreditCard,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Settings,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
export function SuperAdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(res => {
        if(res.success && res.data) setUser(res.data);
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { name: 'Organizations', href: '/super-admin/organizations', icon: Building2 },
    { name: 'Plans & Subs', href: '/super-admin/plans', icon: CreditCard },
  ];

  if (pathname === '/super-admin/login') {
    return null;
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 w-full fixed top-0 left-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center h-10 px-2 group">
            <img src="/logo.webp" alt="Veagle Space Technology" className="h-[40px] w-auto object-contain" />
          </Link>
          <span className="font-bold text-lg whitespace-nowrap hidden sm:block">Admin Portal</span>
        </div>
        <button onClick={() => setIsOpenMobile(!isOpenMobile)} className="p-1">
          {isOpenMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpenMobile(false)} 
        />
      )}

      {/* Sidebar */}
      <div 
        className={`h-screen bg-slate-950 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800
          fixed md:relative top-0 left-0 z-50 md:z-auto pt-16 md:pt-0
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64 
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-slate-800 text-slate-400 hover:text-white rounded-full p-1 border border-slate-700 shadow-lg z-10 hidden md:block"
      >
        <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Header */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950" style={{minHeight: '80px', padding: '12px 16px'}}>
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <Link href="/" className="flex items-center group">
            {isCollapsed ? (
              <img src="/logo.webp" alt="VS" className="h-9 w-9 object-contain rounded-lg" />
            ) : (
              <img src="/logo.webp" alt="Veagle Space Technology" className="h-14 w-auto max-w-[120px] object-contain" />
            )}
          </Link>
          {!isCollapsed && (
            <span className="font-bold text-base text-white whitespace-nowrap">Admin Portal</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                ${isActive 
                  ? 'bg-red-500/10 text-red-400' 
                  : 'hover:bg-slate-900 hover:text-slate-100'
                }
              `}
              title={isCollapsed ? item.name : ''}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Area */}
      <div className="p-4 border-t border-slate-800">
        {!isCollapsed && (
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-red-500 mt-1">Super Admin</p>
          </div>
        )}
        <div className={`flex ${isCollapsed ? 'flex-col items-center gap-2' : 'gap-2'}`}>
          <Link 
            href="/settings"
            className={`p-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors ${!isCollapsed && 'flex-1 flex justify-center'}`}
            title="Account Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button 
            onClick={logout}
            className={`p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors ${!isCollapsed && 'flex-1 flex justify-center'}`}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
