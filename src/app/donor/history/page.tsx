'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { DonationHistory, Donor } from '@/lib/types';
import {
  Calendar,
  PlusCircle,
  Award,
  ArrowLeft,
  Hospital,
  Droplet,
  FileCheck,
  Download,
  X,
  Printer,
  Share2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function DonorHistoryPage() {
  const { currentDonor } = useAuth();
  const [history, setHistory] = useState<DonationHistory[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<DonationHistory | null>(null);

  // Form states
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospital, setHospital] = useState('New York Blood Center (Central)');
  const [location, setLocation] = useState('New York, NY');
  const [units, setUnits] = useState(1);
  const [donationType, setDonationType] = useState<any>('Whole Blood');
  const [notes, setNotes] = useState('Voluntary quarterly donation.');

  const donor = currentDonor || db.getDonorById('donor-1');

  const refreshHistory = () => {
    if (donor) {
      setHistory(db.getDonationHistoryByDonor(donor.id));
    }
  };

  useEffect(() => {
    refreshHistory();
  }, [donor]);

  const handleLogDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donor) return;

    db.addDonationRecord({
      donor_id: donor.id,
      donation_date: donationDate,
      hospital_or_blood_bank: hospital,
      location,
      units_donated: Number(units),
      donation_type: donationType,
      notes,
    });

    setIsLogModalOpen(false);
    refreshHistory();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <Link
          href="/donor/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Donor Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Donation History & Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official immutable log of all voluntary blood donations and verified certificates.
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Donation</span>
        </button>
      </div>

      {/* History Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {history.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No donation records logged yet. Click "Log New Donation" above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Donation Date</th>
                  <th className="px-4 py-3">Facility / Center</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Units</th>
                  <th className="px-4 py-3 rounded-r-xl">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold">{formatDate(rec.donation_date)}</td>
                    <td className="px-4 py-3">{rec.hospital_or_blood_bank}</td>
                    <td className="px-4 py-3">{rec.location}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-[11px]">
                        {rec.donation_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-medical-red">{rec.units_donated} Unit</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedCert(rec)}
                        className="font-mono text-[11px] font-bold text-medical-red hover:underline flex items-center space-x-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{rec.certificate_url}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Donation Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Log Voluntary Blood Donation Record
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogDonation} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Donation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={donationDate}
                    onChange={(e) => setDonationDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Units Donated *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital / Blood Bank Center *
                </label>
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. Mount Sinai Hospital"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Donation Type
                  </label>
                  <select
                    value={donationType}
                    onChange={(e) => setDonationType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                  >
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Platelets">Platelets</option>
                    <option value="Plasma">Plasma</option>
                    <option value="Double Red Cells">Double Red Cells</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition"
                >
                  Save Record & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 border-4 border-double border-red-200 dark:border-red-900 shadow-2xl text-center space-y-4 relative">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-medical-red rounded-full flex items-center justify-center mx-auto">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-medical-red">
                OFFICIAL CERTIFICATE OF VOLUNTARY DONATION
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Life Saver Recognition
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This certificate verifies that <span className="font-bold text-slate-900 dark:text-white">{donor?.name}</span> completed a voluntary donation of <span className="font-bold">{selectedCert.units_donated} Unit ({selectedCert.donation_type})</span> at <span className="font-bold">{selectedCert.hospital_or_blood_bank}</span> on {formatDate(selectedCert.donation_date)}.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              Certificate Ledger ID: {selectedCert.certificate_url}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => typeof window !== 'undefined' && window.print()}
                className="flex-1 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Proud to share my Official Blood Donation Certificate! 🎉\n\nI donated ${selectedCert.units_donated} Unit (${selectedCert.donation_type}) at ${selectedCert.hospital_or_blood_bank}.\nEvery donation saves lives! Register as a donor today on LifeLink.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Certificate</span>
              </a>
            </div>

            <button
              onClick={() => setSelectedCert(null)}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
