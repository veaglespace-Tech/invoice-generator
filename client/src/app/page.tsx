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
          <div className="inline-flex items-center gap-3 px-2 py-1.5 pr-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 hover:shadow-md transition-shadow">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> New
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              The #1 Invoice Generator for Modern Teams
            </span>
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
      
      <section id="features" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-2 shadow-sm border border-indigo-100 dark:border-indigo-800/50">✨ Discover the Magic</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight leading-tight pb-2">Powerful Features</h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to manage your business billing seamlessly and accelerate your growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-3 bg-blue-50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(37,99,235,0.1)] border-2 border-blue-200 hover:shadow-[0_15px_40px_rgb(37,99,235,0.2)] hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl -z-10 group-hover:bg-blue-200 transition-colors duration-300"></div>
              <div className="w-12 h-12 mx-auto bg-white group-hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center rounded-2xl text-blue-600 group-hover:text-white shadow-sm border border-blue-100">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Lightning Fast</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Generate PDF invoices and send them to clients in literally seconds, not minutes.</p>
            </div>
            
            <div className="space-y-3 bg-emerald-50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(16,185,129,0.1)] border-2 border-emerald-200 hover:shadow-[0_15px_40px_rgb(16,185,129,0.2)] hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full blur-2xl -z-10 group-hover:bg-emerald-200 transition-colors duration-300"></div>
              <div className="w-12 h-12 mx-auto bg-white group-hover:bg-emerald-500 transition-colors duration-300 flex items-center justify-center rounded-2xl text-emerald-600 group-hover:text-white shadow-sm border border-emerald-100">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Integrated Payments</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Seamless PayU integration allowing clients to pay directly from the invoice link.</p>
            </div>

            <div className="space-y-3 bg-violet-50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(139,92,246,0.1)] border-2 border-violet-200 hover:shadow-[0_15px_40px_rgb(139,92,246,0.2)] hover:border-violet-300 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-100 rounded-full blur-2xl -z-10 group-hover:bg-violet-200 transition-colors duration-300"></div>
              <div className="w-12 h-12 mx-auto bg-white group-hover:bg-violet-500 transition-colors duration-300 flex items-center justify-center rounded-2xl text-violet-600 group-hover:text-white shadow-sm border border-violet-100">
                <Hexagon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Multi-Org Support</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Manage multiple businesses and branches from a single, unified dashboard.</p>
            </div>

            <div className="space-y-3 bg-amber-50 p-6 rounded-3xl shadow-[0_8px_30px_rgba(245,158,11,0.1)] border-2 border-amber-200 hover:shadow-[0_15px_40px_rgba(245,158,11,0.2)] hover:border-amber-300 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full blur-2xl -z-10 group-hover:bg-amber-200 transition-colors duration-300"></div>
              <div className="w-12 h-12 mx-auto bg-white group-hover:bg-amber-500 transition-colors duration-300 flex items-center justify-center rounded-2xl text-amber-600 group-hover:text-white shadow-sm border border-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Role-Based Access</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Invite your team members with granular permissions (Admin, Viewer, Manager).</p>
            </div>

            <div className="space-y-3 bg-rose-50 p-6 rounded-3xl shadow-[0_8px_30px_rgba(244,63,94,0.1)] border-2 border-rose-200 hover:shadow-[0_15px_40px_rgba(244,63,94,0.2)] hover:border-rose-300 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100 rounded-full blur-2xl -z-10 group-hover:bg-rose-200 transition-colors duration-300"></div>
              <div className="w-12 h-12 mx-auto bg-white group-hover:bg-rose-500 transition-colors duration-300 flex items-center justify-center rounded-2xl text-rose-600 group-hover:text-white shadow-sm border border-rose-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Tax & GST Ready</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Built-in GST calculation, HSN codes, and fully compliant tax invoices.</p>
            </div>

            <div className="space-y-3 bg-cyan-50 p-6 rounded-3xl shadow-[0_8px_30px_rgba(6,182,212,0.1)] border-2 border-cyan-200 hover:shadow-[0_15px_40px_rgba(6,182,212,0.2)] hover:border-cyan-300 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100 rounded-full blur-2xl -z-10 group-hover:bg-cyan-200 transition-colors duration-300"></div>
              <div className="w-12 h-12 mx-auto bg-white group-hover:bg-cyan-500 transition-colors duration-300 flex items-center justify-center rounded-2xl text-cyan-600 group-hover:text-white shadow-sm border border-cyan-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Advanced Analytics</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Track your revenue, unpaid invoices, and business growth at a glance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-2 shadow-sm border border-emerald-100 dark:border-emerald-800/50">💎 Plans & Pricing</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight leading-tight pb-2">Simple, transparent pricing</h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Choose the perfect plan for your business needs. No hidden fees, cancel anytime.</p>
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
