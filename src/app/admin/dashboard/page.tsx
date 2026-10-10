'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  Shield,
  Users,
  Droplet,
  FileCheck,
  Zap,
  Building2,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const { currentUser } = useAuth();

  const [donors, setDonors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    setDonors(db.getDonors());
    setRequests(db.getBloodRequests());
    setPendingDocs(db.getVerificationDocuments('Pending'));
    setAuditLogs(db.getAuditLogs().slice(0, 5));
  }, []);

  const totalDonors = donors.length;
  const verifiedDonors = donors.filter((d) => d.verification_status === 'Verified').length;
  const criticalRequests = requests.filter((r) => r.urgency === 'Critical');
  const fulfilledRequests = requests.filter((r) => r.status === 'Fulfilled').length;

  // Donor blood type breakdown
  const donorsByGroup: Record<BloodGroup, number> = {
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
  };
  donors.forEach((d) => {
    if (donorsByGroup[d.blood_group as BloodGroup] !== undefined) {
      donorsByGroup[d.blood_group as BloodGroup]++;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Master Administrative Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Platform Analytics & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervise donor verification workflows, emergency response dispatch, and facility inventory.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/verification"
            className="px-4 py-2 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
          >
            <FileCheck className="w-4 h-4" />
            <span>Verification Queue ({pendingDocs.length})</span>
          </Link>
          <Link
            href="/admin/requests"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow transition flex items-center space-x-1.5"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Manage SOS Requests</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Donors</span>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{totalDonors}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">{verifiedDonors} Verified Donors</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Requests</span>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{requests.length}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">{fulfilledRequests} Fulfilled</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency SOS</span>
          <span className="text-3xl font-black text-medical-red block">{criticalRequests.length}</span>
          <span className="text-[11px] text-slate-400">Rapid priority alerts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Verification</span>
          <span className="text-3xl font-black text-amber-500 block">{pendingDocs.length}</span>
          <span className="text-[11px] text-amber-600 font-semibold">Requires document check</span>
        </div>
      </div>

      {/* Grid: Blood Type Registry Breakdown & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Blood Group Distribution Grid */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <Droplet className="w-4 h-4 text-medical-red" />
            <span>Active Donors by Blood Group Registry</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {ALL_BLOOD_GROUPS.map((bg) => (
              <div
                key={bg}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <BloodGroupBadge bloodGroup={bg} size="sm" />
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono block">
                    {donorsByGroup[bg]}
                  </span>
                  <span className="text-[10px] text-slate-400">donors</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Actions & Tools */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Administrative Management Modules
          </h3>

          <div className="space-y-2 pt-2">
            <Link
              href="/admin/verification"
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-medical-red flex items-center justify-between group transition"
            >
              <div className="flex items-center space-x-3">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Donor Verification Queue
                  </span>
                  <span className="text-[11px] text-slate-400">Approve ID & blood test documents</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-medical-red transition" />
            </Link>

            <Link
              href="/admin/requests"
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-medical-red flex items-center justify-between group transition"
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-medical-red" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Blood Requests & SOS Monitor
                  </span>
                  <span className="text-[11px] text-slate-400">Oversee hospital requests platform-wide</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-medical-red transition" />
            </Link>

            <Link
              href="/admin/users"
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-medical-red flex items-center justify-between group transition"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    User & Role Management
                  </span>
                  <span className="text-[11px] text-slate-400">Inspect donor and hospital accounts</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-medical-red transition" />
            </Link>

            <Link
              href="/admin/blood-banks"
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-medical-red flex items-center justify-between group transition"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-purple-500" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Blood Bank Inventory Control
                  </span>
                  <span className="text-[11px] text-slate-400">Update stock units across blood centers</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-medical-red transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Audit Trail Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-medical-red" />
            <span>Recent System Audit Trail</span>
          </h3>
          <Link href="/admin/audit-logs" className="text-xs font-bold text-medical-red hover:underline">
            Full Audit Logs →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-[11px] text-medical-red">
                    {log.action}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    by {log.actor_name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Entity: {log.entity_type} ({log.entity_id})
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{formatDate(log.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
