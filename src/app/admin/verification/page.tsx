'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { VerificationDocument, VerificationStatus } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  FileText,
  User,
  Eye,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function AdminVerificationQueuePage() {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Document text is blurry or blood test date is older than 6 months.');

  const refreshQueue = () => {
    setDocuments(db.getVerificationDocuments());
  };

  useEffect(() => {
    refreshQueue();
  }, []);

  const handleReview = (decision: 'Verified' | 'Rejected') => {
    if (!selectedDoc) return;

    db.reviewVerificationDocument(
      selectedDoc.id,
      decision,
      currentUser?.id || 'user-admin-1',
      decision === 'Rejected' ? rejectionReason : undefined
    );

    setSelectedDoc(null);
    refreshQueue();

    if (decision === 'Verified') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const pendingDocs = documents.filter((d) => d.status === 'Pending');
  const reviewedDocs = documents.filter((d) => d.status !== 'Pending');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Donor Credential Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review uploaded blood test certificates and government IDs to assign verified donor status.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
          {pendingDocs.length} Documents Pending Review
        </div>
      </div>

      {/* Pending Reviews Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
          <FileText className="w-4 h-4 text-medical-red" />
          <span>Pending Document Submissions</span>
        </h3>

        {pendingDocs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            All submitted documents have been reviewed. Queue is clear!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {doc.user_name}
                    </span>
                    <BloodGroupBadge bloodGroup={doc.blood_group_claimed} size="sm" />
                    <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300">
                      {doc.document_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    File: {doc.file_name} • Submitted {formatDate(doc.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-4 py-2 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Verify</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previously Reviewed Archive */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Verification Review History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Donor Name</th>
                <th className="px-4 py-3">Claimed Blood Group</th>
                <th className="px-4 py-3">Document Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-xl">Reviewed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {reviewedDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold">{doc.user_name}</td>
                  <td className="px-4 py-3">
                    <BloodGroupBadge bloodGroup={doc.blood_group_claimed} size="sm" />
                  </td>
                  <td className="px-4 py-3">{doc.document_type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(doc.reviewed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Document Review: {selectedDoc.user_name}
                </h3>
                <p className="text-xs text-slate-400">Claimed Blood Group: {selectedDoc.blood_group_claimed}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 text-center">
              <img
                src={selectedDoc.secure_file_reference}
                alt="Document Preview"
                className="w-full h-48 object-cover opacity-90"
              />
              <div className="p-2 bg-slate-900 text-white text-[11px] font-mono">
                {selectedDoc.file_name}
              </div>
            </div>

            {/* Rejection Note Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Decision Notes / Rejection Reason
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-red"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => handleReview('Verified')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Verify Donor</span>
              </button>

              <button
                onClick={() => handleReview('Rejected')}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
