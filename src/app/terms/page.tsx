import React from 'react';
import { Shield, AlertTriangle, Scale, Heart } from 'lucide-react';
import { MEDICAL_SAFETY_DISCLAIMER } from '@/lib/compatibility';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal & Medical Notice</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Terms of Service & Medical Disclaimer
        </h1>
        <p className="text-xs text-slate-500">Updated August 2026</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        
        {/* Core Medical Disclaimer Alert */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Critical Medical Disclaimer:</span>
              {MEDICAL_SAFETY_DISCLAIMER}
            </div>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Coordination Service Only
          </h2>
          <p>
            The Blood Donor Finder platform operates purely as an information, discovery, and coordination conduit between voluntary donors, recipients, and hospital centers. The platform does not prescribe, authorize, or conduct medical transfusions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Prohibition of Commercial Blood Transactions
          </h2>
          <p>
            Soliciting, demanding, offering, or accepting monetary payments or financial remuneration for human blood donation is strictly prohibited by law and platform terms. Violations result in permanent termination and referral to law enforcement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. AI & Compatibility Tools
          </h2>
          <p>
            AI blood type recognition, antigen diagnostic calculators, and red blood cell compatibility tables are educational guides based on established serological biology. Certified blood bank laboratory cross-matching is always required before transfusion.
          </p>
        </section>
      </div>
    </div>
  );
}
