'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Donor, BloodGroup } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  User,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
  Upload,
  EyeOff,
  Eye,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function DonorProfileSettingsPage() {
  const router = useRouter();
  const { currentDonor, currentUser, logout, refreshUserData } = useAuth();
  const donor = currentDonor || db.getDonorById('donor-1');

  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [bio, setBio] = useState('');
  const [emergencyReady, setEmergencyReady] = useState(true);
  const [visibility, setVisibility] = useState<'Public' | 'Hospital_Only' | 'Private'>('Public');
  const [isSaved, setIsSaved] = useState(false);

  // Hide My Profile Toggle
  const isHidden = visibility === 'Private';
  const handleToggleHideProfile = (hide: boolean) => {
    setVisibility(hide ? 'Private' : 'Public');
  };

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Document upload state
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (donor) {
      setName(donor.name);
      setBloodGroup(donor.blood_group);
      setCity(donor.city);
      setArea(donor.area);
      setPinCode(donor.pin_code);
      setBio(donor.bio || '');
      setEmergencyReady(donor.emergency_ready);
      setVisibility(donor.visibility);
    }
  }, [donor]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donor) return;

    db.updateDonor(donor.id, {
      name,
      city,
      area,
      pin_code: pinCode,
      bio,
      emergency_ready: emergencyReady,
      visibility,
    });

    refreshUserData();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUploadTestReport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !donor) return;
    setIsUploadingDoc(true);
    setDocFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      db.submitVerificationDocument({
        user_id: donor.user_id,
        donor_id: donor.id,
        user_name: donor.name,
        document_type: 'Blood Test Report',
        blood_group_claimed: bloodGroup,
        file_name: file.name,
      });
      setIsUploadingDoc(false);
      setDocUploaded(true);
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toLowerCase() !== 'delete') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }

      logout();
      router.push('/?message=account_deleted');
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred while deleting your account.');
      setIsDeleting(false);
    }
  };

  if (!donor) {
    return <div className="p-8 text-center">Donor profile not available.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <Link
          href="/donor/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Donor Dashboard</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Edit Donor Profile & Privacy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure your public bio, neighborhood radius, and data privacy permissions.
            </p>
          </div>
          <BloodGroupBadge bloodGroup={donor.blood_group} size="lg" />
        </div>

        {isSaved && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile and privacy settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group
                </label>
                <input
                  type="text"
                  disabled
                  value={bloodGroup}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Metro City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Locality / Area
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Postal PIN Code
                </label>
                <input
                  type="text"
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 400050 / 110017 / 560034"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Donor Bio & Readiness Statement
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Voluntary blood donor from Mumbai. O- universal donor, available on weekends. Happy to help in emergencies."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
              />
            </div>
          </div>

          {/* Hidden file input for document upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileSelected}
          />

          {/* Privacy & Visibility Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Privacy & Discovery Settings
            </h3>

            {/* "Hide My Profile" Dedicated Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  {isHidden ? <EyeOff className="w-4 h-4 text-medical-red" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Hide My Profile from Public Searches
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isHidden
                    ? 'Your profile is currently hidden and will not appear in the public donor directory or search results.'
                    : 'Your profile is currently public and eligible to match with patient blood requests.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isHidden}
                  onChange={(e) => handleToggleHideProfile(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-red"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audience Scope
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
                >
                  <option value="Public">Public (Searchable by Patients & Hospitals)</option>
                  <option value="Hospital_Only">Hospital Only (Authorized Medical Coordinators)</option>
                  <option value="Private">Private (Hidden from Directory)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={emergencyReady}
                    onChange={(e) => setEmergencyReady(e.target.checked)}
                    className="rounded text-medical-red focus:ring-medical-red h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable Immediate Emergency SOS Callouts
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Verification Document Upload Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Blood Test & Identity Verification
                </h4>
                <p className="text-[11px] text-slate-500">
                  Upload NABL-accredited lab reports or government ID to maintain Verified status.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Status: {donor.verification_status}
              </span>
            </div>

            {docUploaded ? (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  <span className="font-bold">{docFileName}</span> submitted for verification.
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUploadTestReport}
                disabled={isUploadingDoc}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition flex items-center space-x-2"
              >
                <Upload className="w-3.5 h-3.5 text-medical-red" />
                <span>{isUploadingDoc ? 'Reading file...' : 'Upload Lab Report / Govt. ID (PDF, JPG, PNG)'}</span>
              </button>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* DANGER ZONE: DELETE ACCOUNT */}
        <div className="pt-6 border-t border-red-100 dark:border-red-950/60 space-y-3">
          <div className="p-5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone: Delete Account</span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                Permanently delete your user profile, registered donor credentials, and associated data from the platform. This action cannot be reversed.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setDeleteConfirmationText('');
                setIsDeleteModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-medical-red flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Account & Donor Profile?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will permanently delete your donor account, achievements, and availability history. This action is irreversible.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {deleteError && (
                <p className="text-[11px] font-semibold text-red-500">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmationText.trim().toLowerCase() !== 'delete'}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5"
              >
                {isDeleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
