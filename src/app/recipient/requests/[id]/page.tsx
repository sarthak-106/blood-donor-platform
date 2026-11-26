'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BloodRequest, Donor, DonorRequest, RequestStatus } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { AnonymousChatBox } from '@/components/chat/AnonymousChatBox';
import { DonorLiveTrackingMap } from '@/components/tracking/DonorLiveTrackingMap';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Hospital,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  ArrowLeft,
  Zap,
  Calendar,
  Share2,
  XCircle,
  Activity,
  Heart,
  FileText,
} from 'lucide-react';
import { formatDate, formatDateTime, getUrgencyBadgeStyle, getStatusBadgeStyle } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;
  const router = useRouter();
  const { currentUser } = useAuth();

  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [donorResponses, setDonorResponses] = useState<DonorRequest[]>([]);

  const refreshData = () => {
    const foundReq = db.getBloodRequestById(requestId);
    if (foundReq) {
      setRequest({ ...foundReq });
      // Get donor responses from state
      const responses = db.getDonorRequestsByDonor(''); // Or filter by blood_request_id
      const reqResponses = (db as any).state?.donorRequests?.filter(
        (dr: DonorRequest) => dr.blood_request_id === requestId
      ) || [];
      setDonorResponses(reqResponses);
    }
  };

  useEffect(() => {
    refreshData();
  }, [requestId]);

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Request Not Found</h2>
        <p className="text-xs text-slate-500">The blood request ID does not exist or has expired.</p>
        <Link
          href="/recipient/dashboard"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-medical-red text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const urgencyStyle = getUrgencyBadgeStyle(request.urgency);
  const statusStyle = getStatusBadgeStyle(request.status);

  // Stepper timeline stages
  const stages = [
    { label: 'Broadcast Open', status: 'Open' },
    { label: 'Donors Alerted', status: 'Donor Contacted' },
    { label: 'Donor Accepted', status: 'Donor Accepted' },
    { label: 'Transfusion Active', status: 'In Progress' },
    { label: 'Fulfilled', status: 'Fulfilled' },
  ];

  const getStageIndex = (status: RequestStatus) => {
    switch (status) {
      case 'Open':
        return 0;
      case 'Donor Contacted':
        return 1;
      case 'Donor Accepted':
        return 2;
      case 'In Progress':
        return 3;
      case 'Fulfilled':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(request.status);

  const acceptedDonorResponse = donorResponses.find((dr) => dr.status === 'Accepted');
  const activeDonor = acceptedDonorResponse ? db.getDonorById(acceptedDonorResponse.donor_id) : null;
  const isDonorAcceptedOrInProgress =
    request.status === 'Donor Accepted' ||
    request.status === 'In Progress' ||
    Boolean(request.accepted_donors_count && request.accepted_donors_count > 0) ||
    Boolean(acceptedDonorResponse);

  const handleUpdateStatus = (newStatus: RequestStatus) => {
    db.updateBloodRequestStatus(request.id, newStatus);
    refreshData();
    if (newStatus === 'Fulfilled') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back link */}
      <div>
        <Link
          href="/recipient/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recipient Hub</span>
        </Link>
      </div>

      {/* Main Request Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <BloodGroupBadge bloodGroup={request.blood_group} size="lg" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {request.patient_name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${urgencyStyle.bg}`}>
                {urgencyStyle.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg}`}>
                {request.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Request ID: <span className="font-mono">{request.id}</span> • Created {formatDateTime(request.created_at)}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {request.status !== 'Fulfilled' && request.status !== 'Cancelled' && (
              <button
                onClick={() => handleUpdateStatus('Fulfilled')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Fulfilled</span>
              </button>
            )}

            {request.status !== 'Cancelled' && request.status !== 'Fulfilled' && (
              <button
                onClick={() => handleUpdateStatus('Cancelled')}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs transition"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>

        {/* Live Stepper Timeline Bar */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
            Live Request Progress Timeline:
          </span>
          <div className="grid grid-cols-5 gap-2 relative">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.label} className="text-center relative">
                  {/* Step Circle */}
                  <div
                    className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-2 transition-all ${
                      isPast || isCurrent
                        ? 'bg-medical-red text-white shadow-md shadow-red-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                    } ${isCurrent ? 'ring-4 ring-red-300 dark:ring-red-900/60 scale-110' : ''}`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] block leading-tight font-semibold ${
                      isPast || isCurrent
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Request Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Hospital Location</span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              {request.hospital}
            </span>
            <span className="text-slate-500 dark:text-slate-400 block">
              {request.hospital_address || request.city}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Quantity & Deadline</span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              {request.quantity_units} Unit(s) Needed
            </span>
            <span className="text-slate-500 dark:text-slate-400 block">
              Required by {formatDate(request.required_by)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Emergency Contact</span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              {request.contact_number}
            </span>
            <span className="text-slate-500 dark:text-slate-400 block">
              Requester: {request.requester_name}
            </span>
          </div>
        </div>

        {request.notes && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-bold">Medical Case Notes: </span>
            {request.notes}
          </div>
        )}

        {request.prescription_file_name && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 min-w-0">
              {request.prescription_file_url ? (
                <img
                  src={request.prescription_file_url}
                  alt="Prescription document"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 text-medical-red flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block truncate">
                  {request.prescription_file_name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Attached Hospital Requisition / Doctor Prescription
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full shrink-0">
              Verified Attachment
            </span>
          </div>
        )}
      </div>

      {/* Matched Donors & Responses Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-medical-red" />
              <span>Matched Voluntary Donors & Responses</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {request.accepted_donors_count || 0} accepted • {request.matched_donors_count || 0} compatible alerted
            </p>
          </div>
        </div>

        {/* Demo Accepted Donor Showcase */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Amina Al-Mansoor
                </span>
                <BloodGroupBadge bloodGroup="B+" size="sm" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                  ACCEPTED REQUEST
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                Estimated Arrival: ~45 mins • Coordinating with {request.hospital}
              </span>
            </div>
          </div>

          <a
            href="tel:+15554328765"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow transition flex items-center justify-center space-x-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Donor</span>
          </a>
        </div>
      </div>

      {/* Live Donor Transit Tracking Map (Powered by Google Maps Platform) */}
      {isDonorAcceptedOrInProgress && (
        <DonorLiveTrackingMap
          requestId={request.id}
          donorName={activeDonor?.name || acceptedDonorResponse?.donor_name || 'Amina Al-Mansoor'}
          donorBloodGroup={activeDonor?.blood_group || request.blood_group}
          donorPhone={activeDonor?.phone || '+91 98765 43210'}
          hospitalName={request.hospital}
          hospitalCity={request.city}
          initialEta={acceptedDonorResponse?.eta || '20-30 mins'}
        />
      )}

      {/* Anonymous Coordination Chat Box */}
      <AnonymousChatBox
        requestId={request.id}
        patientName={request.patient_name}
        hospitalName={request.hospital}
      />
    </div>
  );
}
