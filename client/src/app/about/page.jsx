import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { 
  Shield, 
  FileText, 
  Zap, 
  Globe, 
  TrendingUp, 
  CreditCard,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: "Active Users", value: "10,000+" },
    { label: "Invoices Generated", value: "1M+" },
    { label: "Countries Served", value: "120+" },
    { label: "Uptime", value: "99.99%" },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Lightning Fast",
      description: "Create and send professional invoices in seconds, not hours.",
      bg: "bg-amber-50 dark:bg-amber-500/10"
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-500" />,
      title: "Seamless Payments",
      description: "Get paid faster with integrated payment gateways and automated reminders.",
      bg: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      title: "Client Management",
      description: "Keep track of all your clients, their details, and payment histories in one place.",
      bg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      title: "Actionable Insights",
      description: "Monitor your revenue, outstanding payments, and business growth with rich analytics.",
      bg: "bg-purple-50 dark:bg-purple-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-indigo-500/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none opacity-70 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-40 -right-20 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl -z-10 pointer-events-none opacity-70"></div>
        
        {/* Hero Section */}
        <section className="text-center space-y-8 mb-32 relative">
          <div className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-4 shadow-sm hover:shadow-md transition-all">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Empowering Modern Businesses
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Billing made <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              effortless & elegant
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Veagle Invoice is built for freelancers, agencies, and growing enterprises. We transform the tedious task of invoicing into a seamless, secure, and professional experience, helping you get paid faster.
          </p>
        </section>

        {/* Stats Section */}
        <section className="mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Why Choose Veagle?</h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We combine cutting-edge technology with intuitive design to deliver an unparalleled billing experience.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Legal & Compliance Section */}
        <section className="relative rounded-[3rem] bg-indigo-50/50 dark:bg-slate-900/40 overflow-hidden border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-100/50 dark:shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[80px] -z-10"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[80px] -z-10"></div>
          
          <div className="relative z-10 p-12 md:p-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Uncompromising Trust</h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">We prioritize your data security and operational transparency above all else. Review our policies to understand our commitment to you.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Privacy Policy Card */}
              <Link href="/privacy-policy" className="group block h-full">
                <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-400 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-2 transition-transform duration-300">
                      &rarr;
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Privacy Policy</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Learn how we employ enterprise-grade security to protect your sensitive financial and personal data.
                  </p>
                </div>
              </Link>

              {/* Terms of Service Card */}
              <Link href="/terms-of-service" className="group block h-full">
                <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-400 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300">
                      &rarr;
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Terms of Service</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Understand the transparent and fair guidelines that govern your experience on our platform.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
