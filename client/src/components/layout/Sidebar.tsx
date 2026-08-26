"use client";

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
  Hexagon,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Items', href: '/products', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-5 left-4 z-[60] p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
        onClick={() => setIsOpenMobile(!isOpenMobile)}
      >
        {isOpenMobile ? <X className="w-6 h-6 text-slate-700 dark:text-slate-200" /> : <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />}
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
        className={`flex flex-col bg-slate-950 text-slate-300 border-r border-slate-800 h-screen transition-all duration-300 z-50 fixed md:relative top-0 left-0
          ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64
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

        <div className="flex items-center justify-center border-b border-slate-800 bg-slate-950" style={{minHeight: '80px', padding: '12px 16px'}}>
          <Link href="/" onClick={() => setIsOpenMobile(false)} className="flex items-center justify-center w-full group">
            {isCollapsed ? (
              <img src="/logo.webp" alt="VS" className="h-9 w-9 object-contain rounded-lg" />
            ) : (
              <img src="/logo.webp" alt="Veagle Space Technology" className="h-14 w-auto max-w-[160px] object-contain" />
            )}
          </Link>
        </div>

      <ul className="menu flex-1 overflow-y-auto py-6 px-3 space-y-1 bg-slate-950">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setIsOpenMobile(false)}
                className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <ul className="menu p-0">
          <li>
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-3 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors duration-200 font-medium group w-full ${
                isCollapsed ? 'justify-center px-0' : 'px-4'
              }`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
              {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
      </div>
    </>
  );
}
