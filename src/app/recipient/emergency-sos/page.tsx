'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups } from '@/lib/compatibility';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { CaptchaChallenge } from '@/components/ui/CaptchaChallenge';
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
  Building2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmergencySOSPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { triggerEmergencyAlert } = useNotifications();

  // Clear unverified mock defaults — use real clean user state
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [quantity, setQuantity] = useState(2);
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+91 ');
  const [notes, setNotes] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Phone OTP Verification State (Mandatory for SOS to prevent abuse)
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // CAPTCHA Challenge State
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [captchaAnswer, setCaptchaAnswer] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);

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
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5 MB limit. Please select a smaller document.');
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

  // Handle Send OTP
  const handleSendOtp = async () => {
    setOtpError(null);
    setOtpMessage(null);
    const cleaned = contactPhone.replace(/\s+/g, '').trim();
    if (!/^\+\d{10,15}$/.test(cleaned)) {
      setOtpError('Please enter a valid phone number with country code (e.g. +91 98765 43210).');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpSent(true);
        setOtpMessage(`OTP sent to ${cleaned}. Valid for 5 minutes.`);
        if (data.devOtp) setDevOtp(data.devOtp);
      } else {
        setOtpError(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setOtpError('Network error. Failed to reach verification service.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    setOtpError(null);
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: contactPhone.replace(/\s+/g, '').trim(),
          otp: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPhoneVerified(true);
        setOtpMessage('✓ Phone number verified successfully.');
      } else {
        setOtpError(data.error || 'Incorrect OTP code. Please try again.');
      }
    } catch {
      setOtpError('Verification request failed. Please check connection.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleTriggerSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setCaptchaError(null);

    // 1. Mandatory requisition slip
    if (!prescriptionFile) {
      setFileError(true);
      document.getElementById('sos-requisition-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 2. Mandatory Phone OTP Verification
    if (!isPhoneVerified) {
      setOtpError('Phone number OTP verification is strictly required for emergency SOS requests.');
      document.getElementById('sos-phone-verification-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 3. CAPTCHA verification
    if (!captchaAnswer.trim()) {
      setCaptchaError('Please solve the anti-spam CAPTCHA challenge before submitting.');
      return;
    }

    setIsBroadcasting(true);

    try {
      const cleanedPhone = contactPhone.replace(/\s+/g, '').trim();

      const response = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_id: currentUser?.id || 'guest_sos_user',
          requester_name: currentUser?.name || patientName || 'Emergency Requester',
          requester_phone: cleanedPhone,
          patient_name: patientName,
          blood_group: bloodGroup,
          hospital,
          city,
          quantity_units: Number(quantity),
          urgency: 'Critical',
          is_emergency_sos: true,
          contact_number: cleanedPhone,
          notes,
          prescription_file_name: prescriptionFile?.name,
          prescription_file_url: prescriptionPreview || undefined,
          otp_verified: true,
          captchaToken,
          captchaAnswer,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to broadcast SOS');
      }

      triggerEmergencyAlert(
        `CRITICAL SOS: ${bloodGroup} Blood Needed at ${hospital}`,
        `${patientName} urgently requires ${quantity} units. All nearby compatible donors alerted.`
      );

      setCreatedRequestId(resData.data.id);
      setIsBroadcasting(false);
      setBroadcastDone(true);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (err: any) {
      setIsBroadcasting(false);
      setSubmitError(err.message || 'An error occurred while broadcasting your SOS request.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Navigation & Direct Helplines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/recipient/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Official 24/7 Helpline 104 Banner */}
        <div className="flex items-center space-x-2 text-xs">
          <a
            href="tel:104"
            className="inline-flex items-center space-x-1.5 bg-red-100 dark:bg-red-950/80 text-medical-red font-bold px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 shadow-sm hover:scale-105 transition"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>National Blood Helpline: 104</span>
          </a>
          <Link
            href="/blood-banks"
            className="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-xl hover:text-medical-red transition"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Call a Blood Bank</span>
          </Link>
        </div>
      </div>

      {/* Main SOS Box with Medical Crimson Theme */}
      <div className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-950 rounded-3xl p-6 sm:p-10 text-white border-2 border-red-600/80 shadow-2xl relative overflow-hidden">
        
        {/* Glow Background */}
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
                Dispatched push, SMS, and WhatsApp alerts to <span className="font-bold text-white">{matchedDonors.length} active compatible donors</span> in {city}.
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

              {/* Immediate National Blood Helpline & Blood Bank fallback */}
              <div className="pt-4 mt-4 border-t border-red-900/60 max-w-lg mx-auto space-y-2">
                <p className="text-[11px] text-red-200">
                  Need immediate direct coordination while waiting for donor responses?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <a
                    href="tel:104"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs shadow-md transition"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>Call National Blood Helpline: 104</span>
                  </a>
                  <Link
                    href="/blood-banks"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-900/80 hover:bg-red-800 text-white font-semibold text-xs border border-red-700 transition"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Call a 24x7 Blood Bank</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTriggerSOS} className="space-y-6">
              
              {submitError && (
                <div className="p-3.5 rounded-2xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Patient & Blood Type */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    Critical Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma (Surgery Patient)"
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
                      placeholder="e.g. AIIMS Trauma Center / City Civil Hospital"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    City / Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-red-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi, Mumbai, Bengaluru"
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
                    Emergency Requester Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-red-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        setIsPhoneVerified(false);
                        setIsOtpSent(false);
                      }}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-red-800/80 text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Phone OTP Verification Section */}
              <div id="sos-phone-verification-section" className="p-4 rounded-2xl bg-slate-950/90 border border-red-800/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-red-200">
                      Phone Number OTP Verification (Mandatory for SOS)
                    </span>
                  </div>
                  {isPhoneVerified ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/50">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Phone Verified</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-300 font-semibold">Verification Required</span>
                  )}
                </div>

                {!isPhoneVerified ? (
                  <div className="space-y-3 pt-1">
                    {!isOtpSent ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-300">
                          We send a rapid 6-digit one-time password to confirm genuine emergency alerts.
                        </p>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition flex items-center justify-center space-x-1.5"
                        >
                          {isSendingOtp ? (
                            <span>Sending OTP...</span>
                          ) : (
                            <>
                              <Phone className="w-3.5 h-3.5" />
                              <span>Send OTP Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit OTP"
                            className="w-40 px-3 py-2 text-center text-sm font-mono font-bold rounded-xl bg-slate-900 border border-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                          >
                            {isVerifyingOtp ? 'Verifying...' : 'Confirm OTP'}
                          </button>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-xs text-red-300 hover:text-white underline underline-offset-2"
                          >
                            Resend
                          </button>
                        </div>
                        {devOtp && (
                          <p className="text-[11px] font-mono text-yellow-300">
                            Development Demo OTP: <strong>{devOtp}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {otpMessage && <p className="text-xs text-emerald-400 font-medium">{otpMessage}</p>}
                    {otpError && <p className="text-xs text-rose-400 font-semibold">{otpError}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-300">
                    Your contact number is authenticated. Available donors can reach you directly upon accepting your emergency broadcast.
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
                  Emergency Clinical Situation / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Critical trauma surgery in progress. Immediate compatible whole blood or packed RBC needed."
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
                    Max 5 MB (PDF, JPG, PNG)
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
                      accept="image/jpeg,image/png,image/webp,application/pdf"
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

                {fileError && !prescriptionFile && (
                  <p className="mt-2 text-xs font-bold text-yellow-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Emergency Requisition Slip / Doctor Authorization is required to broadcast SOS.</span>
                  </p>
                )}
              </div>

              {/* Anti-Spam Security CAPTCHA Challenge */}
              <CaptchaChallenge
                onVerify={(tok, ans) => {
                  setCaptchaToken(tok);
                  setCaptchaAnswer(ans);
                  setCaptchaError(null);
                }}
                error={captchaError}
              />

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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 transition transform active:scale-98 flex items-center justify-center space-x-2"
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
