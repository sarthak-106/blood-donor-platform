'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, HelpCircle, Droplet, Shield } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Who is eligible to donate blood in India?',
      a: 'Healthy adults aged 18–65 years, weighing at least 45 kg, with haemoglobin ≥12.5 g/dL (females) or ≥13.0 g/dL (males), and who have not donated whole blood in the last 3 months (90 days) — as per the National Blood Transfusion Council (NBTC) and Drugs & Cosmetics Act, 1940 guidelines.',
    },
    {
      q: 'How does the Emergency SOS broadcast work?',
      a: 'When an emergency request is created with Critical urgency, our real-time notification engine matches compatible ABO and Rh blood types and pushes instant high-priority alerts to verified nearby donors across Indian cities.',
    },
    {
      q: 'How is donor privacy protected?',
      a: 'Personal mobile numbers and private addresses are never displayed publicly. Contact details are only shared securely upon mutual agreement and request acceptance, in compliance with the IT Act, 2000 and DPDP Act, 2023.',
    },
    {
      q: 'Can an O- donor give to anyone?',
      a: 'Yes, O- (O negative) red blood cells carry no A, B, or Rh surface antigens, making O- the universal red blood cell donor — especially vital in emergency trauma centres across India.',
    },
    {
      q: 'How do donors become "Verified"?',
      a: 'Donors upload NABL-accredited pathology test reports or Aadhaar-linked government-issued ID via their profile dashboard. Platform administrators review the documents before awarding the Verified Donor badge.',
    },
    {
      q: 'Are any fees involved in using the platform?',
      a: 'No. The Blood Donor Finder platform is 100% free and voluntary. Buying or selling human blood is strictly illegal under the Drugs & Cosmetics Act, 1940 and is absolutely prohibited on this platform.',
    },
    {
      q: 'Which cities are currently covered?',
      a: 'We currently cover New Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, and Ahmedabad — with plans to expand to Tier-2 cities soon. Contact our helpline (104 / 1910) to request coverage in your area.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Blood Donation & Platform FAQ
        </h1>
        <p className="text-xs text-slate-500">Everything you need to know about donating and requesting blood.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-medical-red transition"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
