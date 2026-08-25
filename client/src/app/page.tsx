import Link from "next/link";
import { Hexagon, ArrowRight, Zap, Shield, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-100">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center relative pt-24 pb-32 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 border border-indigo-100 dark:border-indigo-900 backdrop-blur-sm text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>The #1 Invoice Generator for Modern Teams</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Get paid faster with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              beautiful invoices.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create, send, and track professional invoices in seconds. Built for freelancers, agencies, and growing organizations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/register" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-1">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
              Sign In
            </Link>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </main>
      
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 bg-blue-50 p-8 rounded-3xl shadow-[0_10px_40px_rgb(37,99,235,0.15)] border-2 border-blue-200 hover:shadow-[0_20px_50px_rgb(37,99,235,0.25)] hover:border-blue-300 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -z-10 group-hover:bg-blue-200 transition-colors duration-300"></div>
              <div className="w-16 h-16 mx-auto bg-white group-hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center rounded-2xl text-blue-600 group-hover:text-white shadow-sm border border-blue-100">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Lightning Fast</h3>
              <p className="text-slate-700 leading-relaxed font-medium">Generate PDF invoices and send them to clients in literally seconds, not minutes.</p>
            </div>
            <div className="space-y-4 bg-emerald-50 p-8 rounded-3xl shadow-[0_10px_40px_rgb(16,185,129,0.15)] border-2 border-emerald-200 hover:shadow-[0_20px_50px_rgb(16,185,129,0.25)] hover:border-emerald-300 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -z-10 group-hover:bg-emerald-200 transition-colors duration-300"></div>
              <div className="w-16 h-16 mx-auto bg-white group-hover:bg-emerald-500 transition-colors duration-300 flex items-center justify-center rounded-2xl text-emerald-600 group-hover:text-white shadow-sm border border-emerald-100">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Secure & Compliant</h3>
              <p className="text-slate-700 leading-relaxed font-medium">Bank-level security and full compliance with GST/TAX regulations globally.</p>
            </div>
            <div className="space-y-4 bg-violet-50 p-8 rounded-3xl shadow-[0_10px_40px_rgb(139,92,246,0.15)] border-2 border-violet-200 hover:shadow-[0_20px_50px_rgb(139,92,246,0.25)] hover:border-violet-300 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-full blur-3xl -z-10 group-hover:bg-violet-200 transition-colors duration-300"></div>
              <div className="w-16 h-16 mx-auto bg-white group-hover:bg-violet-500 transition-colors duration-300 flex items-center justify-center rounded-2xl text-violet-600 group-hover:text-white shadow-sm border border-violet-100">
                <Hexagon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Multi-Org Support</h3>
              <p className="text-slate-700 leading-relaxed font-medium">Manage multiple businesses from a single, unified dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Choose the perfect plan for your business needs. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Starter Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Perfect for freelancers and individuals.</p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">₹0</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/ forever</span>
              </div>
              <ul className="space-y-4 mb-8 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-indigo-500" /> Up to 50 invoices/month</li>
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-indigo-500" /> Basic templates</li>
                <li className="flex items-center gap-3 text-slate-400 dark:text-slate-600"><Zap className="w-5 h-5" /> No multi-org support</li>
              </ul>
              <Link href="/register?plan=starter" className="block w-full text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 py-3 rounded-xl font-semibold transition-colors border border-indigo-100 dark:border-indigo-800/50">
                Get Started
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="bg-indigo-600 rounded-3xl p-8 border border-indigo-500 shadow-2xl shadow-indigo-500/20 transform md:-translate-y-4 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-indigo-200 mb-6">For growing agencies and small businesses.</p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">₹999</span>
                <span className="text-indigo-200 font-medium">/ month</span>
              </div>
              <ul className="space-y-4 mb-8 text-indigo-50">
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400" /> Unlimited invoices</li>
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400" /> Premium templates & branding</li>
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400" /> Up to 3 organizations</li>
              </ul>
              <Link href="/register?plan=professional" className="block w-full text-center bg-white hover:bg-slate-50 text-indigo-600 py-3 rounded-xl font-bold transition-colors shadow-lg">
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">For large organizations with complex needs.</p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">₹2,999</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/ month</span>
              </div>
              <ul className="space-y-4 mb-8 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-indigo-500" /> Unlimited everything</li>
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-indigo-500" /> Dedicated account manager</li>
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-indigo-500" /> Custom integrations</li>
              </ul>
              <Link href="/register?plan=enterprise" className="block w-full text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 py-3 rounded-xl font-semibold transition-colors border border-indigo-100 dark:border-indigo-800/50">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
