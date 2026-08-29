"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hexagon, ArrowRight, ArrowLeft, CheckCircle2, Building, User, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const steps = [
  { id: 1, name: 'Organization', icon: Building },
  { id: 2, name: 'Admin Profile', icon: User },
  { id: 3, name: 'Choose Plan', icon: CreditCard },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  React.useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetchApi<{ success: boolean; data: any[] }>('/plans');
        if (res.success && res.data) {
          setPlans(res.data);
          if (res.data.length > 0) {
            setSelectedPlan(res.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, []);

  // Form State - Organization (Expanded)
  const [orgName, setOrgName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [GSTIN, setGSTIN] = useState('');
  const [PAN, setPAN] = useState('');

  // Form State - Admin Profile
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Form State - Plan
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const [isSuccess, setIsSuccess] = useState(false);

  const validateStep1 = () => {
    if (!orgName || orgName.trim().length < 2) return 'Organization Name is required (min 2 chars)';
    if (!orgEmail || !/^\S+@\S+\.\S+$/.test(orgEmail)) return 'A valid Organization Email is required';
    if (!country) return 'Country is required';
    return null;
  };

  const validateStep2 = () => {
    if (!userName || userName.trim().length < 2) return 'Admin Name must be at least 2 characters';
    if (!email) return 'Admin Email is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid Admin email format';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const nextStep = () => {
    setError(null);
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) return setError(err);
      
      // Auto-fill admin email if empty based on org email
      if (!email) setEmail(orgEmail);
    }
    
    if (currentStep === 2) {
      const err = validateStep2();
      if (err) return setError(err);
    }

    if (currentStep < 3) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Create Organization and Admin User
      const response = await fetchApi<{ success: boolean; data: any }>('/auth/register', {
        method: 'POST',
        data: { 
          orgName, 
          userName, 
          email, 
          password,
          // Extra Org Details
          legalName,
          orgPhone,
          address,
          city,
          state,
          country,
          pincode,
          GSTIN,
          PAN,
          plan_id: selectedPlan
        }
      });

      if (response.success && response.data) {
        // If it's a paid plan, we initiate payment immediately
        const planObj = plans.find(p => p.id === selectedPlan);
        const isPaid = planObj && Number(planObj.price) > 0;

        if (isPaid) {
          // Trigger subscription endpoint directly with new login context
          try {
            // First we need to get a token to make authenticated requests
            // Let's call login to get a token
            const loginRes = await fetchApi<{ success: boolean; data: { accessToken: string } }>('/auth/login', {
              method: 'POST',
              data: { email, password }
            });

            if (loginRes.success && loginRes.data) {
              const token = loginRes.data.accessToken;
              localStorage.setItem('auth_token', token);
              
              const payRes = await fetchApi<{ success: boolean; data: any }>('/subscriptions/initiate', {
                method: 'POST',
                data: { plan_id: selectedPlan }
              });

              if (payRes.success && payRes.data) {
                const payuData = payRes.data;
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
                addField('service_provider', 'payu_paisa');

                document.body.appendChild(form);
                form.submit();
              } else {
                setError('Account created! But payment initiation failed. Please login and go to Settings > Billing.');
                setIsLoading(false);
              }
            }
          } catch (err: any) {
            setError('Account created, but could not initiate payment.');
            setIsLoading(false);
          }
        } else {
          // Free plan — show success and redirect to login
          localStorage.removeItem('auth_token');
          setIsSuccess(true);
          setTimeout(() => {
            router.push('/login');
          }, 3500);
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
              addField('service_provider', 'payu_paisa');

              document.body.appendChild(form);
              form.submit();
            } else {
              setError('Account created! But payment initiation failed. Please login and go to Settings > Billing.');
              setIsLoading(false);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register account.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-100">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-indigo-600 dark:bg-indigo-900 -z-10 clip-path-slant pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 flex flex-col items-center p-6 z-10 pt-28">
        {/* We use max-w-4xl for the first step because it's a big form, max-w-2xl for others */}
        <div className={`w-full ${currentStep === 1 ? 'max-w-4xl' : 'max-w-2xl'} bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all`}>
          
          {/* Stepper Header */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 dark:bg-indigo-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                    isActive ? 'border-indigo-100 dark:border-indigo-900/50 bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 
                    isCompleted ? 'border-indigo-600 bg-indigo-600 text-white' : 
                    'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="min-h-[250px]">
            {isSuccess && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 animate-in zoom-in duration-500">
                {/* Animated checkmark */}
                <div className="relative">
                  <div className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
                    <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-30"></div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">🎉 Registration Successful!</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-base">
                    Welcome, <span className="font-semibold text-slate-800 dark:text-white">{orgName}</span>!<br />
                    Your account has been created successfully.
                  </p>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl px-6 py-4 text-center">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                    📧 Please login with your email to continue
                  </p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">Email: {email}</p>
                </div>

                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to Login page...
                </div>
              </div>
            )}
            
            {!isSuccess && currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-5">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Let's set up your business</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your company's official details for invoicing and billing.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Organization Name *</label>
                    <input 
                      type="text" 
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                      placeholder="e.g. Stark Industries" 
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Legal Name</label>
                    <input 
                      type="text" 
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                      placeholder="e.g. Stark Industries Pvt. Ltd." 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Company Email *</label>
                    <input 
                      type="email" 
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                      placeholder="billing@stark.com" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Phone Number</label>
                    <input 
                      type="tel" 
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                      placeholder="+1 (555) 123-4567" 
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Address & Tax Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Street Address</label>
                      <input 
                        type="text" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                        placeholder="10880 Malibu Point" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">City</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                        placeholder="Malibu" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">State / Province</label>
                      <input 
                        type="text" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                        placeholder="CA" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Country *</label>
                      <input 
                        type="text" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                        placeholder="United States" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">ZIP / Pincode</label>
                      <input 
                        type="text" 
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                        placeholder="90265" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">GSTIN / Tax ID</label>
                      <input 
                        type="text" 
                        value={GSTIN}
                        onChange={(e) => setGSTIN(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all uppercase" 
                        placeholder="Tax Identification Number" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">PAN Number</label>
                      <input 
                        type="text" 
                        value={PAN}
                        onChange={(e) => setPAN(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all uppercase" 
                        placeholder="ABCDE1234F" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isSuccess && currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-5">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create Admin Profile</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">This account will have full access to {orgName || 'the organization'}.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Full Name</label>
                    <input 
                      type="text" 
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                      placeholder="Tony Stark" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Admin Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                      placeholder="tony@stark.com" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm dark:text-white transition-all" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>
            )}

            {!isSuccess && currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Choose your plan</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">No credit card required for 14-day trials.</p>
                </div>

                <div className="flex justify-center">
                  <div className="inline-flex bg-slate-100 dark:bg-slate-950 rounded-full p-1 border border-slate-200 dark:border-slate-800">
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
                      Yearly <span className="text-indigo-600 dark:text-indigo-400 ml-1">-20%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {loadingPlans ? (
                    <div className="col-span-full flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      No plans available at the moment.
                    </div>
                  ) : plans.map(plan => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all relative ${selectedPlan === plan.id ? (plan.is_popular ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md transform -translate-y-1' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md transform -translate-y-1') : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'}`}
                    >
                      {plan.is_popular && (
                        <div className="absolute top-0 right-4 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Popular</div>
                      )}
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                      <p className={`font-bold text-2xl mb-3 ${plan.is_popular ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ₹{plan.price}<span className="text-sm text-slate-500 font-medium">/{plan.interval}</span>
                      </p>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5 h-32 overflow-y-auto">
                        {plan.features.map((feat: string, i: number) => (
                          <li key={i}>• {feat}</li>
                        ))}
                      </ul>
                      {selectedPlan === plan.id && (
                        <div className={`mt-3 text-xs font-semibold flex items-center gap-1 ${plan.is_popular ? 'text-indigo-600' : 'text-emerald-600'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected {Number(plan.price) > 0 ? '— PayU payment will open' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedPlan && plans.find(p => p.id === selectedPlan)?.price > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <span>💳</span>
                    <span>After registration, <strong>PayU payment page</strong> will open. Complete payment to activate your plan.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {!isSuccess && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={prevStep}
                className={`flex items-center gap-2 font-medium transition-colors ${currentStep === 1 ? 'text-transparent pointer-events-none' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              {currentStep < 3 ? (
                <button 
                  onClick={nextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Completing...
                    </>
                  ) : (
                    <>
                      Complete Setup <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        .clip-path-slant {
          clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
        }
      `}</style>
    </div>
  );
}
