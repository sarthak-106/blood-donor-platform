'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BloodGroup, UrgencyLevel } from '@/lib/types';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import {
  Droplet,
  Hospital,
  MapPin,
  Calendar,
  Phone,
  User,
  ArrowLeft,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  Zap,
  Upload,
  FileText,
  X,
  ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CreateRequestPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [patientName, setPatientName] = useState('Aarav Mehta');
  const [patientAge, setPatientAge] = useState<number | ''>(8);
  const [patientGender, setPatientGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [hospital, setHospital] = useState('AIIMS New Delhi');
  const [hospitalAddress, setHospitalAddress] = useState('Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029');
  const [city, setCity] = useState('New Delhi');
  const [area, setArea] = useState('Ansari Nagar');
  const [pinCode, setPinCode] = useState('110029');
  const [quantity, setQuantity] = useState(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Urgent');
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+91 98201 23456');
  const [notes, setNotes] = useState('Scheduled pediatric cardiac surgery in Trauma Centre. Replacement donors requested.');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string>('');

  // File upload state for requisition / prescription
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image (JPG, PNG, WEBP) or a PDF file.');
      return;
    }
    setError('');
    setPrescriptionFile(file);

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

  // Compatible donor groups
  const compatibleTypes = getCompatibleDonorGroups(bloodGroup);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Please enter patient name.');
      return;
    }
    if (!hospital.trim()) {
      setError('Please enter hospital name.');
      return;
    }
    if (!contactPhone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }

    try {
      const newReq = db.createBloodRequest({
        requester_id: currentUser?.id || 'user-recipient-1',
        requester_name: currentUser?.name || 'Sarah Jenkins',
        requester_phone: contactPhone,
        requester_role: currentUser?.role || 'recipient',
        patient_name: patientName,
        patient_age: patientAge ? Number(patientAge) : undefined,
        patient_gender: patientGender,
        blood_group: bloodGroup,
        hospital,
        hospital_address: hospitalAddress,
        city,
        area,
        pin_code: pinCode,
        quantity_units: Number(quantity),
        required_by: new Date(requiredDate).toISOString(),
        urgency,
        contact_number: contactPhone,
        notes,
        prescription_file_name: prescriptionFile?.name,
        prescription_file_url: prescriptionPreview || (prescriptionFile ? URL.createObjectURL(prescriptionFile) : undefined),
      });

      setCreatedRequestId(newReq.id);
      setIsSuccess(true);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setError('Failed to create request. Please check fields and try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <Link
          href="/recipient/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recipient Hub</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Title */}
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Standard Blood Request Form</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Create Blood Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Provide patient clinical info and hospital location to notify matching nearby donors.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Blood Request Successfully Broadcasted!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your request for <span className="font-bold text-slate-900 dark:text-white">{bloodGroup}</span> blood at <span className="font-bold text-slate-900 dark:text-white">{hospital}</span> has been dispatched. Nearby matching donors have been alerted.
            </p>
            <div className="pt-4 flex justify-center space-x-3">
              <Link
                href={`/recipient/requests/${createdRequestId}`}
                className="px-6 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
              >
                Track Live Request Timeline
              </Link>
              <Link
                href="/recipient/dashboard"
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Patient Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-medical-red" />
                <span>1. Patient Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Lucas Jenkins"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Age
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 28"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>
              </div>

              {/* Blood Group Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Required Blood Group *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ALL_BLOOD_GROUPS.map((bg) => {
                    const isSelected = bloodGroup === bg;
                    return (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => setBloodGroup(bg)}
                        className={`py-2 rounded-xl text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-medical-red text-white shadow-md ring-2 ring-red-400 scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {bg}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Compatible donor types for {bloodGroup}: <span className="font-bold text-slate-800 dark:text-slate-200">{compatibleTypes.join(', ')}</span>
                </p>
              </div>
            </div>

            {/* Section 2: Hospital & Location Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                <Hospital className="w-4 h-4 text-medical-red" />
                <span>2. Hospital & Transfusion Center</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="e.g. AIIMS New Delhi / Apollo Hospital"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Metro City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi / Mumbai / Bengaluru"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Hospital Street Address
                </label>
                <input
                  type="text"
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  placeholder="e.g. Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Quantity, Urgency & Contact */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-medical-red" />
                <span>3. Units, Urgency & Contact</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Units Needed (Bags) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-medical-red focus:outline-none"
                  >
                    <option value="Normal">Normal (Within 48h)</option>
                    <option value="Urgent">Urgent (Within 12-24h)</option>
                    <option value="Critical">Critical SOS (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required By Date
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medical Notes / Surgery Information
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Scheduled cardiovascular procedure. Replacement units needed before 8:00 AM."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>
            </div>

            {/* Section 4: Doctor's Prescription / Hospital Requisition Form */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-medical-red" />
                  <span>4. Doctor's Prescription / Hospital Requisition Form</span>
                </h3>
                <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
                  Optional • Boosts Donor Verification
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
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none ${
                    isDragging
                      ? 'border-medical-red bg-red-50/60 dark:bg-red-950/20 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-medical-red hover:bg-red-50/30 dark:hover:bg-red-950/10'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex flex-col items-center space-y-2.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                      isDragging
                        ? 'bg-medical-red text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {isDragging ? 'Drop your prescription or requisition here' : 'Drag & drop medical requisition form from local files'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        or <span className="text-medical-red font-bold underline underline-offset-2">browse local files</span>
                      </p>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Supports JPG, PNG, WEBP, PDF (Doctor slips, pathology requisitions, hospital stamp slips)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    {prescriptionPreview ? (
                      <img
                        src={prescriptionPreview}
                        alt="Prescription preview"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-red-100 dark:bg-red-950 text-medical-red flex items-center justify-center font-bold">
                        <FileText className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {prescriptionFile.name}
                        </span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          Ready to upload
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {(prescriptionFile.size / 1024).toFixed(1)} KB • {prescriptionFile.type || 'Document'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition"
                      title="Remove attached file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Broadcast Request to Matching Donors</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
