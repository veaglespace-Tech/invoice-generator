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
  X
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
        className={`flex flex-col w-64 bg-slate-950 text-slate-300 border-r border-slate-800 h-screen transition-all duration-300 z-50 fixed md:relative top-0 left-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-center h-20 border-b border-slate-800 pt-8 md:pt-0 bg-slate-950">
          <Link href="/dashboard" className="flex items-center justify-center w-full h-full px-6 py-2 group">
            <img src="/logo.webp" alt="Veagle Space Technology" className="h-[64px] w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

      <ul className="menu flex-1 overflow-y-auto py-6 px-3 space-y-1 bg-slate-950">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
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
              className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors duration-200 font-medium group w-full"
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
              Logout
            </button>
          </li>
        </ul>
      </div>
      </div>
    </>
  );
}
