"use client";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold group cursor-pointer py-1">
            <img src="/logo.webp" alt="Veagle Space Technology" className="h-[40px] md:h-[48px] w-auto object-contain transition-all" />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-8 font-medium text-slate-600 dark:text-slate-300">
            <li><Link href="/#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link></li>
            <li><Link href="/#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link></li>
            {!isLoggedIn && <li><Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign In</Link></li>}
          </ul>
          <div className="pl-6 border-l border-slate-200 dark:border-slate-700">
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Actions */}
        <div className="flex md:hidden items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium text-sm shadow-sm transition-all flex items-center gap-1">
              Dashboard
            </Link>
          ) : (
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium text-sm shadow-sm transition-all">
              Start
            </Link>
          )}
          <button 
            className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-xl flex flex-col z-40 animate-in slide-in-from-top-4 duration-300">
          <Link href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 font-medium text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Features</Link>
          <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 font-medium text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Pricing</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 font-medium text-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Dashboard</Link>
          ) : (
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 font-medium text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
