import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Payment Successful | Invoice Generator',
};

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-slate-800">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Thank you for your purchase. Your subscription is now active, and you can start using all the features of your plan.
        </p>
        <Link
          href="/login"
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
