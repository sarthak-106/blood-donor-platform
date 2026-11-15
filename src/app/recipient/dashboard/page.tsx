'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { BloodRequest, Donor } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { DonorCard } from '@/components/donors/DonorCard';
import {
  Heart,
  Droplet,
  PlusCircle,
  Zap,
  Clock,
  CheckCircle2,
  Users,
  Star,
  Hospital,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate, getUrgencyBadgeStyle, getStatusBadgeStyle } from '@/lib/utils';

export default function RecipientDashboard() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [favorites, setFavorites] = useState<Donor[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  const handleMarkFulfilled = (requestId: string) => {
    setFulfillingId(requestId);
    setTimeout(() => {
      db.updateBloodRequestStatus(requestId, 'Fulfilled');
      refreshData();
      setFulfillingId(null);
    }, 600);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toLowerCase() !== 'delete') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete account');
      logout();
      router.push('/?message=account_deleted');
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred while deleting your account.');
      setIsDeleting(false);
    }
  };

  const refreshData = () => {
    if (currentUser) {
      setRequests(db.getBloodRequests({ requesterId: currentUser.id }));
      setFavorites(db.getFavoritesByUser(currentUser.id));
    } else {
      // Show all requests for demo visualization if not logged in
      setRequests(db.getBloodRequests());
      setFavorites([]);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const activeRequests = requests.filter((r) => r.status !== 'Fulfilled' && r.status !== 'Cancelled');
  const fulfilledRequests = requests.filter((r) => r.status === 'Fulfilled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Emergency SOS Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-medical-red uppercase tracking-wider block">
            Recipient Hub & Coordination Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome, {currentUser ? currentUser.name : 'Blood Recipient'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your active blood requests, track donor responses, and broadcast emergency SOS alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/recipient/create-request"
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Standard Request</span>
          </Link>
          <Link
            href="/recipient/emergency-sos"
            className="px-4 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/25 transition flex items-center space-x-1.5 animate-pulse"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Emergency SOS</span>
          </Link>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Requests
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {activeRequests.length}
          </span>
          <span className="text-[11px] text-slate-500">In open & contacted state</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Fulfilled Requests
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            {fulfilledRequests.length}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Successfully matched</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Favorite Donors
          </span>
          <span className="text-2xl font-black text-amber-500 block">
            {favorites.length}
          </span>
          <span className="text-[11px] text-slate-500">Saved for quick request</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Avg Donor Response
          </span>
          <span className="text-2xl font-black text-medical-red block">
            &lt; 15 mins
          </span>
          <span className="text-[11px] text-slate-500">Fast community response</span>
        </div>
      </div>

      {/* Active Requests List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
              <Droplet className="w-5 h-5 text-medical-red" />
              <span>Your Blood Requests</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track live donor status, acceptance ETAs, and hospital confirmations.
            </p>
          </div>
          <Link
            href="/recipient/create-request"
            className="text-xs font-bold text-medical-red hover:underline flex items-center space-x-1"
          >
            <span>+ New Request</span>
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Droplet className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No requests created yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't submitted any blood requests yet. Click below to create a standard request or trigger an Emergency SOS.
            </p>
            <div className="pt-2">
              <Link
                href="/recipient/create-request"
                className="px-4 py-2 rounded-xl bg-medical-red text-white text-xs font-bold shadow"
              >
                Create First Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const urgencyStyle = getUrgencyBadgeStyle(req.urgency);
              const statusStyle = getStatusBadgeStyle(req.status);

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <BloodGroupBadge bloodGroup={req.blood_group} size="md" />
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {req.patient_name}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${urgencyStyle.bg}`}>
                        {urgencyStyle.label}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg}`}>
                        {req.status}
                      </span>
                      {req.component && req.component !== 'Whole Blood' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {req.component}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <Hospital className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {req.hospital} ({req.city})
                      </span>
                      <span>•</span>
                      <span>{req.quantity_units} Unit(s) Required</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Required by {formatDate(req.required_by)}
                      </span>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right Side Actions */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                        {req.accepted_donors_count || 0} Donor(s) Accepted
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {req.matched_donors_count || 0} compatible alerted
                      </span>
                    </div>

                    {req.status !== 'Fulfilled' && req.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleMarkFulfilled(req.id)}
                        disabled={fulfillingId === req.id}
                        title="Mark this request as fulfilled"
                        className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition flex items-center space-x-1 disabled:opacity-50"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>{fulfillingId === req.id ? 'Saving…' : 'Fulfilled'}</span>
                      </button>
                    )}

                    <Link
                      href={`/recipient/requests/${req.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition flex items-center space-x-1"
                    >
                      <span>Track Status</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Favorite Donors Grid Preview */}
      {favorites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Saved Favorite Donors</span>
            </h3>
            <Link
              href="/find-donor"
              className="text-xs font-bold text-medical-red hover:underline"
            >
              Browse All Donors →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {favorites.map((donor) => (
              <DonorCard key={donor.id} donor={donor} onFavoriteChange={refreshData} />
            ))}
          </div>
        </div>
      )}
      {/* Account Settings / Privacy */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Account Settings & Privacy
        </h3>

        <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone: Delete Account</span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              Permanently delete your recipient account, past blood requests, and personal records. This action cannot be undone.
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

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-medical-red flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Account & Profile?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will permanently delete your account and personal details. This action is irreversible.
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
