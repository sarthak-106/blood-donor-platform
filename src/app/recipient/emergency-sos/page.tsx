'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  Zap,
  AlertTriangle,
  Hospital,
  MapPin,
  Clock,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Users,
  Shield,
  Upload,
  FileText,
  X,
  ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmergencySOSPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { triggerEmergencyAlert } = useNotifications();

  const [patientName, setPatientName] = useState('Aarav Mehta (Pediatric Emergency)');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [hospital, setHospital] = useState('AIIMS New Delhi (Trauma Centre)');
  const [city, setCity] = useState('New Delhi');
  const [quantity, setQuantity] = useState(3);
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+91 98201 23456');
  const [notes, setNotes] = useState('Critical trauma surgery in progress at AIIMS Trauma Centre. Immediate B+ or O+ whole blood or RBC required.');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string>('');

  // File upload state for urgent medical requisition
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload an image (JPG, PNG, WEBP) or a PDF file.');
      return;
    }
    setPrescriptionFile(file);
    setFileError(false);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPrescriptionPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPrescriptionPreview(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const compatibleTypes = getCompatibleDonorGroups(bloodGroup);
  const matchedDonors = db.getDonors({ bloodGroup, includeCompatible: true, city });

  const handleTriggerSOS = (e: React.FormEvent) => {
    e.preventDefault();

    // Requisition slip is mandatory
    if (!prescriptionFile) {
      setFileError(true);
      document.getElementById('sos-requisition-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsBroadcasting(true);

    setTimeout(() => {
      const newSOS = db.createBloodRequest({
        requester_id: currentUser?.id || 'user-recipient-1',
        requester_name: currentUser?.name || 'Sarah Jenkins',
        requester_phone: contactPhone,
        patient_name: patientName,
        blood_group: bloodGroup,
        hospital,
        city,
        quantity_units: Number(quantity),
        urgency: 'Critical',
        is_emergency_sos: true,
        contact_number: contactPhone,
        notes,
        prescription_file_name: prescriptionFile?.name,
        prescription_file_url: prescriptionPreview || (prescriptionFile ? URL.createObjectURL(prescriptionFile) : undefined),
      });

      triggerEmergencyAlert(
        `CRITICAL SOS: ${bloodGroup} Blood Needed at ${hospital}`,
        `${patientName} urgently requires ${quantity} units. All nearby compatible donors alerted.`
      );

      setCreatedRequestId(newSOS.id);
      setIsBroadcasting(false);
      setBroadcastDone(true);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <Link
          href="/recipient/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main SOS Box with Crimson Theme */}
      <div className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-950 rounded-3xl p-6 sm:p-10 text-white border-2 border-red-600/80 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-red-900/60">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/40 animate-pulse">
                <Zap className="w-7 h-7 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-2 py-0.5 rounded">
                  PRIORITY EMERGENCY BROADCAST
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Emergency Blood SOS Dispatch
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-red-900/50 px-3 py-1.5 rounded-xl border border-red-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span className="font-bold text-yellow-300">Live Rapid Responder Network</span>
            </div>
          </div>

          {broadcastDone ? (
            <div className="py-10 text-center space-y-4 bg-slate-900/80 rounded-2xl p-6 border border-red-800">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-600/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Emergency SOS Broadcast Live!
              </h3>
              <p className="text-xs text-red-200 max-w-md mx-auto">
                Dispatched push and SMS notification pings to <span className="font-bold text-white">{matchedDonors.length} active compatible donors</span> in {city}.
              </p>
              <div className="pt-4 flex justify-center space-x-3">
                <Link
                  href={`/recipient/requests/${createdRequestId}`}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Monitor Live Responses</span>
                </Link>
                <Link
                  href="/recipient/dashboard"
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTriggerSOS} className="space-y-6">
              
              {/* Patient & Blood Type */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    Critical Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-bold"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    Required Blood Group *
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white font-black text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hospital & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    Hospital / Trauma Center *
                  </label>
                  <div className="relative">
                    <Hospital className="w-4 h-4 text-red-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    Metro City *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-red-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Units & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    Units Urgently Needed (Bags) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    Emergency Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-red-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                  Emergency Clinical Situation
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                />
              </div>

              {/* Hospital Requisition / Doctor Prescription Document Dropzone */}
              <div id="sos-requisition-section">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300">
                    Emergency Requisition Slip / Doctor Authorization *
                  </label>
                  <span className="text-[10px] text-red-300/80 font-mono">
                    Drop from local files
                  </span>
                </div>

                {!prescriptionFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all select-none ${
                      fileError
                        ? 'border-yellow-400 bg-yellow-900/20'
                        : isDragging
                        ? 'border-red-400 bg-red-900/40 scale-[1.01]'
                        : 'border-red-900/80 bg-slate-900/60 hover:border-red-500 hover:bg-red-950/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <div className="flex flex-col items-center space-y-1.5 py-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                        fileError ? 'bg-yellow-600 text-white' : isDragging ? 'bg-red-500 text-white' : 'bg-red-950 text-red-400'
                      }`}>
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {isDragging ? 'Drop authorization slip here' : 'Drop emergency requisition file here'}
                        </p>
                        <p className="text-[10px] text-red-300/80">
                          or <span className="text-white font-bold underline">browse local files</span> (JPG, PNG, PDF)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-red-800 bg-red-950/50 p-3 flex items-center space-x-3">
                    {prescriptionPreview ? (
                      <img
                        src={prescriptionPreview}
                        alt="Requisition preview"
                        className="w-12 h-12 object-cover rounded-xl border border-red-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-red-900 flex items-center justify-center text-white">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {prescriptionFile.name}
                      </p>
                      <p className="text-[10px] text-red-300">
                        {(prescriptionFile.size / 1024).toFixed(1)} KB • Attached from local files
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-1.5 text-red-300 hover:text-white rounded-lg hover:bg-red-900 transition"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Required error message */}
                {fileError && !prescriptionFile && (
                  <p className="mt-2 text-xs font-bold text-yellow-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Emergency Requisition Slip / Doctor Authorization is required to broadcast SOS.</span>
                  </p>
                )}
              </div>

              {/* Target Matching Summary */}
              <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-red-400" />
                  <span>
                    Auto-Targeting: <span className="font-bold text-white">{compatibleTypes.join(', ')}</span> Donors
                  </span>
                </div>
                <span className="font-bold text-emerald-400">
                  {matchedDonors.length} Potential Donors in Range
                </span>
              </div>

              {/* Broadcast Button */}
              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 transition transform active:scale-98 flex items-center justify-center space-x-2"
              >
                {isBroadcasting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Broadcasting SOS to All Donors...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current animate-pulse" />
                    <span>BROADCAST EMERGENCY SOS NOW</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
