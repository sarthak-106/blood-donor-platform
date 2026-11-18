'use client';

import React from 'react';
import Link from 'next/link';
import { Droplet, Heart, Shield, Award, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { MEDICAL_SAFETY_DISCLAIMER } from '@/lib/compatibility';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-medical-red flex items-center justify-center text-white shadow-md shadow-red-500/20">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                Blood<span className="text-medical-red">Donor</span> Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A centralized digital coordination network connecting voluntary blood donors, patients, and healthcare facilities with real-time matching and AI-powered compatibility recognition.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Verified Donors</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Zero Commercialization</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/find-donor" className="hover:text-white transition">{t('findDonors')}</Link>
              </li>
              <li>
                <Link href="/blood-recognition" className="hover:text-white transition">{t('bloodGroupGuide')}</Link>
              </li>
              <li>
                <Link href="/blood-compatibility" className="hover:text-white transition">{t('compatibilityMatrix')}</Link>
              </li>
              <li>
                <Link href="/blood-banks" className="hover:text-white transition">{t('bloodBanks')}</Link>
              </li>
              <li>
                <Link href="/camps" className="hover:text-white transition">{t('camps')}</Link>
              </li>
              <li>
                <Link href="/eligibility" className="hover:text-white transition">{t('eligibility')}</Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition text-amber-400 font-semibold">{t('community')}</Link>
              </li>
              <li>
                <Link href="/recipient/emergency-sos" className="text-medical-red hover:underline font-semibold">{t('emergencySos')}</Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/recipient/dashboard" className="hover:text-white transition">Recipient Hub</Link>
              </li>
              <li>
                <Link href="/donor/dashboard" className="hover:text-white transition">Donor Dashboard</Link>
              </li>
              <li>
                <Link href="/donor/qr-profile" className="hover:text-white transition">Digital QR Pass</Link>
              </li>
              <li>
                <Link href="/donor/history" className="hover:text-white transition">Donation History</Link>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Company & Safety</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition">About Us</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">FAQ & Guidelines</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">Contact Support</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">Terms & Medical Notice</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Safety Disclaimer Alert */}
        <div className="my-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[11px] leading-relaxed">
          <div className="flex items-start space-x-2.5">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">Important Medical Safety Principle: </span>
              {MEDICAL_SAFETY_DISCLAIMER}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-4">
          <p>© {new Date().getFullYear()} BloodDonor Platform. All rights reserved.</p>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <span>Powered by Next.js & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
