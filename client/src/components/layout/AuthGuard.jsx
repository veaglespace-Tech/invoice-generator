'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
export function AuthGuard({ children, requireSuperAdmin = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    // Check if we are running in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');

      // Bypass for login pages
      if (pathname === '/login' || pathname === '/super-admin/login') {
        setIsAuthenticated(true);
        if (requireSuperAdmin) setIsSuperAdmin(true);
        return;
      }

      // If no token, redirect to login
      if (!token) {
        setIsAuthenticated(false);
        router.replace(requireSuperAdmin ? '/super-admin/login' : '/login');
        return;
      }
      if (requireSuperAdmin) {
        // Fetch user profile to check role
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success && res.data && res.data.role === 'SUPER_ADMIN') {
              setIsSuperAdmin(true);
              setIsAuthenticated(true);
            } else {
              router.replace('/dashboard'); // redirect to normal dashboard if not super admin
            }
          })
          .catch(() => {
            router.replace('/super-admin/login');
          });
      } else {
        // Normal app route - still need to check if they are a super admin
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success && res.data) {
              if (res.data.role === 'SUPER_ADMIN') {
                router.replace('/super-admin/dashboard');
              } else {
                setIsAuthenticated(true);
              }
            } else {
              localStorage.removeItem('auth_token');
              router.replace('/login');
            }
          })
          .catch(() => {
            localStorage.removeItem('auth_token');
            router.replace('/login');
          });
      }
    }
  }, [pathname, router, requireSuperAdmin]);

  // While checking authentication status, show a full screen loader
  if (isAuthenticated === null || (requireSuperAdmin && !isSuperAdmin)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  // If authenticated, render the children (the protected app routes)
  if (isAuthenticated === true) {
    return <>{children}</>;
  }

  // If not authenticated, we return null while the redirect happens
  return null;
}
