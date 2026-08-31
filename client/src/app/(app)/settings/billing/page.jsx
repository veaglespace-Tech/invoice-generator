'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  CheckCircle2,
  IndianRupee,
  Loader2,
  Zap,
  Star,
  Shield
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
const plans = [
  {
    id: 'FREE',
    name: 'Free Plan',
    price: '0',
    period: 'forever',
    icon: Shield,
    color: 'slate',
    features: [
      '1 User only',
      'Up to 10 Invoices/month',
      'Basic Invoicing',
      'Community Support'
    ],
    recommended: false,
    isFree: true
  },
  {
    id: 'BASIC',
    name: 'Basic Plan',
    price: '999',
    period: 'month',
    icon: Zap,
    color: 'indigo',
    features: [
      'Up to 5 Users',
      'Unlimited Invoices',
      'Standard Analytics',
      'GST & Tax Ready',
      'Email Support'
    ],
    recommended: false,
    isFree: false
  },
  {
    id: 'PRO',
    name: 'Pro Plan',
    price: '1999',
    period: 'month',
    icon: Star,
    color: 'violet',
    features: [
      'Unlimited Users',
      'Unlimited Invoices',
      'Advanced Analytics',
      'Custom Domain',
      'Priority Support',
      'PayU Payment Integration'
    ],
    recommended: true,
    isFree: false
  }
];
export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('FREE');
  useEffect(() => {
    loadCurrentPlan();
  }, []);
  const loadCurrentPlan = async () => {
    try {
      const res = await fetchApi('/auth/me');
      if (res.success && res.data?.organization?.plan) {
        setCurrentPlan(res.data.organization.plan);
      }
    } catch {
      // silently fail
    }
  };
  const handleSubscribe = async (plan) => {
    if (plan.isFree) return; // Free plan – no payment needed

    setLoadingPlan(plan.id);
    setError(null);
    try {
      const res = await fetchApi('/subscriptions/initiate', {
        method: 'POST',
        data: {
          plan: plan.id
        }
      });
      if (res.success && res.data) {
        const payuData = res.data;

        // Dynamically create a form and submit it to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payuData.action;
        const addField = (name, value) => {
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
        addField('service_provider', 'payu_paisa');
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setLoadingPlan(null);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Billing & Plans
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Choose a plan that fits your business needs.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const PlanIcon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 ${plan.recommended ? 'border-2 border-violet-500 shadow-2xl shadow-violet-100 dark:shadow-violet-900/20 scale-[1.02]' : 'border border-slate-200 dark:border-slate-800'}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold py-1.5 text-center uppercase tracking-widest">
                  ✦ Most Popular
                </div>
              )}

              <div className={`p-6 ${plan.recommended ? 'pt-10' : 'pt-6'}`}>
                {/* Plan Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : plan.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                  >
                    <PlanIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1 mb-1">
                  <IndianRupee className="w-6 h-6 text-slate-900 dark:text-white mb-1" />
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 mb-1 ml-1 text-sm">
                    / {plan.period}
                  </span>
                </div>
                {plan.isFree && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
                    No credit card required
                  </p>
                )}
                {!plan.isFree && (
                  <p className="text-xs text-slate-400 mb-4">
                    Billed monthly via PayU
                  </p>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mr-2.5 flex-shrink-0 ${plan.color === 'violet' ? 'text-violet-500' : plan.color === 'indigo' ? 'text-indigo-500' : 'text-slate-400'}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <div className="w-full py-3 rounded-xl font-semibold text-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm">
                    ✓ Current Plan
                  </div>
                ) : plan.isFree ? (
                  <div className="w-full py-3 rounded-xl font-semibold text-center bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-sm cursor-default">
                    Free – No Payment Needed
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 ${plan.recommended ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-200 dark:shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Opening Payment...
                      </>
                    ) : (
                      <>
                        <IndianRupee className="w-4 h-4" />
                        Pay ₹{plan.price} & Upgrade
                      </>
                    )}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
        Secured payment powered by <strong>PayU</strong>. Your data is safe and
        encrypted.
      </p>
    </div>
  );
}
