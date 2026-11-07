import React from 'react';
import type { Metadata } from 'next';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Donor Data Protection',
  description: 'Our strict privacy guidelines ensuring zero unauthorized exposure of donor contact info and medical documents.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>HIPAA & GDPR Compliant Medical Privacy</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Privacy Policy & Data Protection
        </h1>
        <p className="text-xs text-slate-500">Effective Date: August 2026 • Version 2.4</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-medical-red" />
            <span>1. Zero Public Exposure of Donor Contact Data</span>
          </h2>
          <p>
            Under our core privacy architecture, voluntary blood donor phone numbers, residential street addresses, and full medical test files are strictly shielded. Public search only reveals general neighborhood / metro radius and blood group compatibility. Direct contact numbers are only transmitted following mutual donor acceptance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span>2. Document Verification Storage</span>
          </h2>
          <p>
            Uploaded blood test reports and government identification documents are encrypted in transit and at rest. They are accessible exclusively to authorized platform verifiers and are permanently expunged upon certification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>3. Non-Commercialization Guarantee</span>
          </h2>
          <p>
            We never monetize, sell, license, or exchange user or patient health data with third-party advertisers or commercial entities.
          </p>
        </section>
      </div>
    </div>
  );
}
