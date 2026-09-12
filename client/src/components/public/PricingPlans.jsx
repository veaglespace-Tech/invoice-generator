'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
export function PricingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetchApi('/plans');
        if (res.success && res.data) {
          setPlans(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);
  const [isYearly, setIsYearly] = useState(true);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  if (plans.length === 0) {
    return null; // Don't show pricing section if no plans available
  }
  
  const filteredPlans = plans.filter((p) => p.interval === (isYearly ? 'year' : 'month'));
  
  const getGridCols = () => {
    if (filteredPlans.length === 1) return 'max-w-md mx-auto';
    if (filteredPlans.length === 2) return 'grid md:grid-cols-2 max-w-4xl mx-auto';
    if (filteredPlans.length === 3) return 'grid md:grid-cols-3 max-w-6xl mx-auto';
    return 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto';
  };
  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-100 dark:bg-slate-900 rounded-full p-1 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${!isYearly ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${isYearly ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Yearly
            {plans.some(p => p.interval === 'year' && p.discount > 0) && (
              <span className="text-indigo-600 dark:text-indigo-400 ml-1">
                -{Math.max(...plans.filter(p => p.interval === 'year').map(p => Number(p.discount) || 0))}%
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={`${getGridCols()} gap-8 items-stretch`}>
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-6 md:p-8 border shadow-sm transition-all flex flex-col h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg text-slate-900 dark:text-white ${plan.is_popular ? 'transform md:-translate-y-4 relative shadow-md border-indigo-500 dark:border-indigo-500' : ''}`}
          >
            {plan.is_popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg whitespace-nowrap">
                Most Popular
              </div>
            )}

            <h3 className="text-xl md:text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="mb-6 h-10 line-clamp-2 text-slate-500 dark:text-slate-400">
              {plan.description}
            </p>

            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-bold">₹{plan.price}</span>
              <span className="font-medium text-slate-500 dark:text-slate-400">
                / {plan.interval}
              </span>
            </div>
            {Number(plan.discount) > 0 && (
              <div className="text-xs text-emerald-600 font-semibold mb-1">
                {plan.discount}% Off applied
              </div>
            )}
            {Number(plan.gst_rate) > 0 && (
              <div className="text-xs text-slate-400 mb-6">
                + {plan.gst_rate}% GST
              </div>
            )}
            {!(Number(plan.discount) > 0) && !(Number(plan.gst_rate) > 0) && (
              <div className="mb-6"></div>
            )}

            <ul className="space-y-3 mb-6 flex-1 text-sm md:text-base text-slate-600 dark:text-slate-300">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Zap className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/register?plan=${plan.id}`}
              className={`block w-full text-center py-3 md:py-3.5 rounded-xl font-bold transition-all transform hover:-translate-y-[1px] active:scale-[0.98] mt-auto shadow-sm hover:shadow-md ${plan.is_popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent' : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50'}`}
            >
              {plan.is_popular ? 'Get Started Now' : 'Get Started'}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
