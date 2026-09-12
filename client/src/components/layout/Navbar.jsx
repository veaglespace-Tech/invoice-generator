'use client';

import Link from 'next/link';
import { ArrowRight, LayoutDashboard, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleScroll = (e, id) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-1 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer -ml-2"
          >
            <img
              src="/logo.webp"
              alt="Veagle Space Logo"
              className="h-[48px] md:h-[64px] w-auto object-contain animate-coin-flip"
            />
            <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
              Veagle <span className="text-blue-500 dark:text-blue-400 font-medium">Space</span>
            </span>
          </Link>
        </div>

        {/* Desktop Menu - Centered Links */}
        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-4 font-medium text-slate-600 dark:text-slate-300 text-xs md:text-sm">
            <li>
              <Link
                href="/"
                className="relative px-3 py-1.5 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 group whitespace-nowrap"
              >
                Home
              </Link>
            </li>
            <li>
              <a
                href="/#features"
                onClick={(e) => handleScroll(e, 'features')}
                className="relative px-3 py-1.5 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 group whitespace-nowrap cursor-pointer"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="/#pricing"
                onClick={(e) => handleScroll(e, 'pricing')}
                className="relative px-3 py-1.5 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 group whitespace-nowrap cursor-pointer"
              >
                Pricing
              </a>
            </li>
            <li>
              <Link
                href="/about"
                className="relative px-3 py-1.5 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 group whitespace-nowrap"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="relative px-3 py-1.5 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 group whitespace-nowrap"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-4 min-w-[200px]">
          {isMounted &&
            (isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs md:text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-4 py-1.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ))}
        </div>

        {/* Mobile Menu Actions */}
        <div className="flex md:hidden items-center gap-2 sm:gap-3">
          {isMounted &&
            (isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm shadow-sm transition-all"
              >
                Start
              </Link>
            ))}
          <button
            className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-xl flex flex-col z-40 animate-in slide-in-from-top-4 duration-300">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 font-medium text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={(e) => handleScroll(e, 'features')}
            className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 font-medium text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="/#pricing"
            onClick={(e) => handleScroll(e, 'pricing')}
            className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 font-medium text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Pricing
          </a>
          {isMounted &&
            (isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-4 font-medium text-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-4 font-medium text-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Sign In
              </Link>
            ))}
        </div>
      )}
    </header>
  );
}
