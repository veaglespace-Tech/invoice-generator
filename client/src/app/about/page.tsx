import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Shield, FileText } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto w-full relative">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-900 text-white font-medium text-sm mb-4 shadow-sm uppercase tracking-widest">
            Company Overview
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
            About Veagle Space
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Veagle Space Technology Pvt. Ltd. is dedicated to building elite enterprise tools for modern teams. We focus on uncompromising security, absolute transparency, and technological excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Privacy Policy Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 group relative overflow-hidden transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -z-10 transition-colors duration-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40"></div>
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-600/30">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Privacy Policy</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed text-lg font-light">
              We take your data privacy seriously. Read our comprehensive policy to understand how we collect, use, and protect your personal and business information with enterprise-grade security.
            </p>
            <Link href="/privacy-policy" className="inline-flex items-center font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group-hover:underline decoration-2 underline-offset-4 transition-all">
              Read Privacy Policy <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          {/* Terms of Service Card */}
          <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-10 border border-slate-800 shadow-2xl shadow-slate-900/20 hover:shadow-3xl hover:border-emerald-500/50 transition-all duration-300 group relative overflow-hidden transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-900/20 rounded-bl-full -z-10 transition-colors duration-500 group-hover:bg-emerald-900/40"></div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Terms of Service</h2>
            <p className="text-slate-300 mb-10 leading-relaxed text-lg font-light">
              Understand the rules, guidelines, and agreements that govern your use of the Veagle Space invoicing platform. We believe in clear, transparent, and fair terms for all our users.
            </p>
            <Link href="/terms-of-service" className="inline-flex items-center font-bold text-emerald-400 hover:text-emerald-300 group-hover:underline decoration-2 underline-offset-4 transition-all">
              Read Terms of Service <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
