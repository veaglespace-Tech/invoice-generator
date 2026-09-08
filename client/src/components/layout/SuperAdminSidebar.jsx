'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  ShieldAlert,
  LogOut,
  Settings,
  Receipt,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
export function SuperAdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [user, setUser] = useState(null);
  React.useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((res) => {
            if (res.status === 401) {
              localStorage.removeItem('auth_token');
            }
            return res.json();
          })
          .then((res) => {
            if (res.success && res.data) setUser(res.data);
          })
          .catch((err) => {
            console.warn('Failed to load superadmin profile', err);
          });
      }
    };
    fetchUser();
    window.addEventListener('profileUpdated', fetchUser);
    return () => window.removeEventListener('profileUpdated', fetchUser);
  }, []);
  const logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };
  const navItems = [
    {
      name: 'Dashboard',
      href: '/super-admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'All Invoices',
      href: '/super-admin/invoices',
      icon: Receipt
    },
    {
      name: 'Plans & Subs',
      href: '/super-admin/plans',
      icon: CreditCard
    },
    {
      name: 'Leads',
      href: '/super-admin/leads',
      icon: MessageSquare
    }
  ];
  if (pathname === '/super-admin/login') {
    return null;
  }
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 w-full fixed top-0 left-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => setIsOpenMobile(false)}
            className="flex items-center h-10 px-2 group"
          >
            <img
              src="/logo.webp"
              alt="Veagle Space Technology"
              className="h-[40px] w-auto object-contain animate-coin-flip transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <span className="font-bold text-lg whitespace-nowrap hidden sm:block">
            Admin Portal
          </span>
        </div>
        <button onClick={() => setIsOpenMobile(!isOpenMobile)} className="p-1">
          {isOpenMobile ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
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
        className={`h-screen bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none
          fixed md:relative top-0 left-0 z-50 md:z-50 pt-16 md:pt-0
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64 
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 rounded-full p-1 border border-indigo-700 dark:border-indigo-400 shadow-md shadow-indigo-500/30 z-10 hidden md:block transition-all duration-200"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Header */}
        <div
          className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          style={{
            minHeight: '80px',
            padding: '12px 16px'
          }}
        >
          <div className="flex items-center gap-3 w-full">
            <Link href="/" className="flex items-center justify-center w-full group">
              {isCollapsed ? (
                <img
                  src="/logo.webp"
                  alt="VS"
                  className="h-10 w-10 object-contain rounded-lg flex-shrink-0 animate-coin-flip"
                />
              ) : (
                <div className="flex items-center gap-2 px-1 w-full justify-start -ml-2">
                  <img
                    src="/logo.webp"
                    alt="Veagle Space Logo"
                    className="h-14 w-auto max-w-[140px] object-contain flex-shrink-0 animate-coin-flip"
                  />
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                    Veagle <span className="text-blue-500 dark:text-blue-400 font-medium">Space</span>
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                href={item.href}
                className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-300 font-medium group relative
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/30 dark:to-slate-900 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-500 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white border-l-4 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                  }
                  ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                `}
                title={isCollapsed ? item.name : undefined}
                key={item.name}
                onClick={() => setIsOpenMobile(false)}
              >
                <item.icon
                  className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} 
                    transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}`}
                />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {!isCollapsed && (
            <div className="mb-4 px-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-red-500 mt-1">
                Super Admin
              </p>
            </div>
          )}
          <div
            className={`flex ${isCollapsed ? 'flex-col items-center gap-3' : 'gap-3'} w-full`}
          >
            <Link
              href="/super-admin/settings"
              className={`p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 flex items-center justify-center group ${!isCollapsed ? 'w-14' : 'w-full'}`}
              title="Account Settings"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            </Link>
            <button
              onClick={logout}
              className={`flex items-center justify-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-300 font-medium group flex-1 ${isCollapsed ? 'px-0 w-full' : 'px-4'}`}
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
