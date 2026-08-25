"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, IndianRupee, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

const plans = [
  {
    id: 'BASIC',
    name: 'Basic Plan',
    price: '999',
    features: ['Up to 5 Users', 'Standard Invoicing', 'Basic Analytics', 'Email Support'],
    recommended: false
  },
  {
    id: 'PRO',
    name: 'Pro Plan',
    price: '1999',
    features: ['Unlimited Users', 'Advanced Invoicing', 'Custom Domain', 'Priority Support'],
    recommended: true
  }
];

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    setError(null);

    try {
      const res = await fetchApi<{
        success: boolean;
        data: {
          key: string;
          txnid: string;
          amount: string;
          productinfo: string;
          firstname: string;
          email: string;
          phone: string;
          surl: string;
          furl: string;
          hash: string;
          action: string;
        }
      }>('/subscriptions/initiate', {
        method: 'POST',
        data: { plan: planId }
      });

      if (res.success && res.data) {
        const payuData = res.data;

        // Dynamically create a form and submit it to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payuData.action;

        const addField = (name: string, value: string) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        };

        addField('key', payuData.key);
        addField('txnid', payuData.txnid);
        addField('amount', payuData.amount);
        addField('productinfo', payuData.productinfo);
        addField('firstname', payuData.firstname);
        addField('email', payuData.email);
        addField('phone', payuData.phone);
        addField('surl', payuData.surl);
        addField('furl', payuData.furl);
        addField('hash', payuData.hash);
        addField('service_provider', 'payu_paisa'); // required by PayU standard checkout

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initiate payment.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Billing & Plans</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your subscription and billing details.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden ${plan.recommended ? 'border-2 border-indigo-500 shadow-xl' : ''}`}>
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Recommended
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl text-slate-500">{plan.name}</CardTitle>
              <div className="mt-4 flex items-center justify-center">
                <IndianRupee className="w-8 h-8 text-slate-900 dark:text-white" />
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-slate-500 ml-2">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan !== null}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  plan.recommended
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
                }`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
