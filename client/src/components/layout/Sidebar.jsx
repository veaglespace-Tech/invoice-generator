'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: Receipt
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users
  },
  {
    name: 'Items',
    href: '/products',
    icon: Package
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3
  }
];
export function Sidebar() {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  React.useEffect(() => {
    const checkRole = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await fetchApi('/auth/me');
        if (res.success && res.data && res.data.role === 'SUPER_ADMIN') {
          setIsSuperAdmin(true);
        }
      } catch (err) {
        console.warn('Failed to fetch user role');
      }
    };
    checkRole();
  }, []);
  const router = import('next/navigation').then(m => m.useRouter); // Or better to use the hook at the top
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login'; // keeping as href since logout needs hard reload sometimes, but we can silence linter with eslint-disable-next-line
  };
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden fixed top-3 left-4 z-40 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 ${isOpenMobile ? 'hidden' : 'block'}`}
        onClick={() => setIsOpenMobile(true)}
      >
        <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
      </button>

      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={`flex flex-col bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 h-screen transition-all duration-300 shadow-xl shadow-slate-200/20 dark:shadow-none
          fixed md:relative top-0 left-0 z-50 md:z-50
          ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64
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

        <div
          className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          style={{
            minHeight: '80px',
            padding: '12px 16px'
          }}
        >
          <div className="flex items-center gap-3 w-full">
            <Link
              href="/"
              onClick={() => setIsOpenMobile(false)}
              className="flex items-center justify-center w-full group"
            >
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
            
            {isOpenMobile && (
              <button
                onClick={() => setIsOpenMobile(false)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors md:hidden"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            )}
          </div>
        </div>

        <ul className="menu flex-1 overflow-y-auto py-6 px-3 space-y-1 bg-white dark:bg-slate-900">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
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
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsOpenMobile(false);
                    }
                  }}
                >
                  <item.icon
                    className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} 
                      transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}`}
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}

          {isSuperAdmin && (
            <>
              <li>
                <Link
                  href="/super-admin/organizations"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${pathname === '/super-admin/organizations' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold' : 'text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}`}
                  title={isCollapsed ? 'Organizations (Admin)' : undefined}
                >
                  <Shield
                    className={`w-5 h-5 flex-shrink-0 ${pathname === '/super-admin/organizations' ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">
                      Organizations (Admin)
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/super-admin/plans"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${pathname === '/super-admin/plans' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold' : 'text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}`}
                  title={isCollapsed ? 'Plans (Admin)' : undefined}
                >
                  <CreditCard
                    className={`w-5 h-5 flex-shrink-0 ${pathname === '/super-admin/plans' ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">Plans (Admin)</span>
                  )}
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div
            className={`flex ${isCollapsed ? 'flex-col items-center gap-3' : 'gap-3'} w-full`}
          >
            <Link
              href="/settings"
              className={`p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 flex items-center justify-center group ${!isCollapsed ? 'w-14' : 'w-full'}`}
              title="Settings"
              onClick={() => setIsOpenMobile(false)}
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            </Link>
            <button
              onClick={handleLogout}
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
