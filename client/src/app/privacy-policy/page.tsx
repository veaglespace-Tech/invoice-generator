import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you register for an account, create or modify your profile, 
              generate invoices, request customer support, or communicate with us. The types of information we may collect include 
              your name, email address, postal address, password, phone number, and any other information you choose to provide.
            </p>

            <h2>2. How We Use Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our invoice generation services. This includes 
              using your information to:
            </p>
            <ul>
              <li>Process transactions and send related information, including confirmations and invoices.</li>
              <li>Send you technical notices, updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
              <li>Communicate with you about products, services, offers, and events offered by Veagle Space Technology.</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not share your personal information with third parties except as described in this Privacy Policy. 
              We may share personal information with vendors, consultants, and other service providers who need access 
              to such information to carry out work on our behalf (e.g., payment processors like PayU).
            </p>

            <h2>4. Data Security</h2>
            <p>
              Veagle Space Technology takes reasonable measures to help protect information about you from loss, theft, 
              misuse and unauthorized access, disclosure, alteration and destruction. However, no data transmission over 
              the internet or information storage technology can be guaranteed to be 100% secure.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:<br/>
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
