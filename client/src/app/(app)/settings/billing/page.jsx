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
// Map standard plan names to icons and colors
const getPlanVisuals = (name) => {
  const planName = name.toLowerCase();
  if (planName.includes('free')) {
    return { icon: Shield, color: 'slate' };
  } else if (planName.includes('basic')) {
    return { icon: Zap, color: 'indigo' };
  } else {
    return { icon: Star, color: 'violet' };
  }
};
export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    loadPlans();
    loadCurrentPlan();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await fetchApi('/plans');
      if (res.success && res.data) {
        setPlans(res.data);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };
  const [usage, setUsage] = useState(null);

  const loadCurrentPlan = async () => {
    try {
      const res = await fetchApi('/auth/me');
      if (res.success && res.data?.organization?.plan_id) {
        setCurrentPlan(res.data.organization.plan_id);
      } else if (res.success && res.data?.organization?.plan?.id) {
        setCurrentPlan(res.data.organization.plan.id);
      }

      const subRes = await fetchApi('/subscriptions/current');
      if (subRes.success && subRes.usage) {
        setUsage(subRes.usage);
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

      {loadingPlans ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id || (currentPlan === 'FREE' && plan.price === 0);
            const visuals = getPlanVisuals(plan.name);
            const PlanIcon = visuals.icon;
          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 ${plan.is_popular ? 'border-violet-500 shadow-md shadow-violet-500/10' : 'border-slate-200 dark:border-slate-800'}`}
            >
              {plan.is_popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Recommended
                </div>
              )}

              <CardContent className="pt-6">
                {/* Plan Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-${visuals.color}-100 dark:bg-${visuals.color}-900/30 text-${visuals.color}-600 dark:text-${visuals.color}-400 flex items-center justify-center`}
                  >
                    <PlanIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="w-5 h-5 text-slate-900 dark:text-white" />
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-500 text-sm font-medium">
                      /{plan.interval}
                    </span>
                  </div>
                </div>
                {plan.isFree && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
                    No credit card required
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
                        className={`w-4 h-4 mr-2.5 flex-shrink-0 text-${visuals.color}-500`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="w-full flex flex-col gap-2">
                    <div className="w-full py-3 rounded-xl font-semibold text-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Current Plan
                    </div>
                    {usage && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 text-center space-y-1 mt-2">
                        <p>
                          Invoices: <span className="font-medium text-slate-700 dark:text-slate-300">{usage.invoices}</span>
                          {plan.max_invoices !== -1 ? ` / ${plan.max_invoices}` : ' (Unlimited)'}
                        </p>
                        <p>
                          Customers: <span className="font-medium text-slate-700 dark:text-slate-300">{usage.customers}</span>
                          {plan.max_customers !== -1 ? ` / ${plan.max_customers}` : ' (Unlimited)'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlan !== null}
                    className="w-full relative group overflow-hidden bg-slate-900 hover:bg-slate-800 text-white border-0 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Upgrade Plan'
                      )}
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
        Secured payment powered by <strong>PayU</strong>. Your data is safe and
        encrypted.
      </p>
    </div>
  );
}
