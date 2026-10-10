'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { BloodRequest, RequestStatus } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  Zap,
  Droplet,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Hospital,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { formatDate, getUrgencyBadgeStyle, getStatusBadgeStyle } from '@/lib/utils';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const refreshRequests = () => {
    setRequests(db.getBloodRequests());
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: RequestStatus) => {
    db.updateBloodRequestStatus(id, newStatus);
    refreshRequests();
  };

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Blood Request & SOS Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Oversee active hospital requests, emergency SOS status, and fulfillment overrides.
          </p>
        </div>

        {/* Status Filter */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
          {['all', 'Open', 'Donor Accepted', 'Fulfilled', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {st === 'all' ? 'All Requests' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Patient / ID</th>
                <th className="px-4 py-3">Blood Type</th>
                <th className="px-4 py-3">Hospital & City</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((req) => {
                const urgencyStyle = getUrgencyBadgeStyle(req.urgency);
                const statusStyle = getStatusBadgeStyle(req.status);

                return (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {req.patient_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{req.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <BloodGroupBadge bloodGroup={req.blood_group} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold">{req.hospital}</span>
                      <span className="text-[10px] text-slate-400">{req.city}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${urgencyStyle.bg}`}>
                        {urgencyStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle.bg}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {req.status !== 'Fulfilled' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Fulfilled')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                        <Link
                          href={`/recipient/requests/${req.id}`}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-[10px] hover:bg-slate-100"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
