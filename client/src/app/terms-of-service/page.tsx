import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Terms of Service</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the invoice generation services provided by Veagle Space Technology, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              To use certain features of our service, you must register for an account. You are responsible for safeguarding your 
              password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized 
              use of your account.
            </p>

            <h2>3. Subscription and Payments</h2>
            <p>
              Some of our services are billed on a subscription basis. You will be billed in advance on a recurring and periodic 
              basis. Billing cycles are set on a monthly or annual basis, depending on the type of subscription plan you select 
              when purchasing a subscription. Payments are securely processed via PayU.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>
              You agree not to use the service to generate invoices for illegal activities, fraudulent businesses, or to send 
              spam. We reserve the right to terminate accounts that violate these guidelines without prior notice.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              In no event shall Veagle Space Technology, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
              loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability 
              to access or use the Service.
            </p>

            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:<br/>
              <strong>Veagle Space Technology Pvt. Ltd.</strong><br/>
              Pune, Maharashtra, India<br/>
              Phone/WhatsApp: +91 8237999101
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
