"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
  is_popular: boolean;
}

export function PricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetchApi<{ success: boolean; data: Plan[] }>('/plans');
        if (res.success && res.data) {
          setPlans(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

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

  const getGridCols = () => {
    if (plans.length === 1) return 'max-w-md mx-auto';
    if (plans.length === 2) return 'grid md:grid-cols-2 max-w-4xl mx-auto';
    if (plans.length === 3) return 'grid md:grid-cols-3 max-w-6xl mx-auto';
    return 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto';
  };

  return (
    <div className={`${getGridCols()} gap-8 items-stretch`}>
      {plans.map((plan) => (
        <div 
          key={plan.id}
          className={`rounded-3xl p-8 border shadow-sm transition-all flex flex-col h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg text-slate-900 dark:text-white ${
            plan.is_popular ? 'transform md:-translate-y-4 relative shadow-md' : ''
          }`}
        >
          {plan.is_popular && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg whitespace-nowrap">
              Most Popular
            </div>
          )}
          
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="mb-6 h-10 line-clamp-2 text-slate-500 dark:text-slate-400">
            {plan.description}
          </p>
          
          <div className="mb-8 flex items-baseline gap-1">
            <span className="text-5xl font-extrabold">₹{plan.price}</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              / {plan.interval}
            </span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1 text-slate-600 dark:text-slate-300">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Zap className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <Link 
            href={`/register?plan=${plan.id}`}
            className="block w-full text-center py-3.5 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 mt-auto bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50"
          >
            {plan.is_popular ? 'Get Started Now' : 'Get Started'}
          </Link>
        </div>
      ))}
    </div>
  );
}
