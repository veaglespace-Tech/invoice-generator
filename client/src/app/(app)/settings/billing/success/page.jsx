import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
export default function BillingSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-slate-500 mb-8">
          Your subscription has been successfully updated. Thank you for your
          purchase!
        </p>
        <Link href="/dashboard">
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all">
            Return to Dashboard
          </button>
        </Link>
      </Card>
    </div>
  );
}
