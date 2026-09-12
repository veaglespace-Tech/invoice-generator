'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function PaymentFailedPage() {
  useEffect(() => {
    // Clear any authentication tokens so the user is not logged in after cancelling payment
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-slate-800">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Payment Failed
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          We couldn't process your payment. This might be due to a cancelled transaction or a problem with your payment method.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            Login to Try Again
          </Link>
          <Link
            href="/"
            className="block w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
