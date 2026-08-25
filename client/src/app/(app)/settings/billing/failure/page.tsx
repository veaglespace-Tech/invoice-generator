import React from 'react';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function BillingFailurePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Failed</h2>
        <p className="text-slate-500 mb-8">
          We could not process your payment at this time. Please try again or contact support.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/settings/billing">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all">
              Try Again
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-all">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
