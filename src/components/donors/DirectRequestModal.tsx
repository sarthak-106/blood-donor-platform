'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Donor, BloodGroup, UrgencyLevel } from '@/lib/types';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  X,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  Hospital,
  MapPin,
  Calendar,
  Phone,
  Upload,
  FileText,
  ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DirectRequestModalProps {
  donor?: Donor | null;
  isOpen: boolean;
  onClose: () => void;
  defaultBloodGroup?: BloodGroup;
}

export const DirectRequestModal: React.FC<DirectRequestModalProps> = ({
  donor,
  isOpen,
  onClose,
  defaultBloodGroup,
}) => {
  const { currentUser } = useAuth();
  const { triggerEmergencyAlert } = useNotifications();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(
    donor ? donor.blood_group : defaultBloodGroup || 'O+'
  );
  const [hospital, setHospital] = useState('AIIMS New Delhi');
  const [hospitalAddress, setHospitalAddress] = useState('Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029');
  const [city, setCity] = useState(donor ? donor.city : 'New Delhi');
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Urgent');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '+91 98201 23456');
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // File upload state
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

  if (!isOpen) return null;

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
    if (!contactNumber.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }

    try {
      const createdRequest = db.createBloodRequest({
        requester_id: currentUser?.id || 'user-recipient-1',
        requester_name: currentUser?.name || 'Anonymous Recipient',
        requester_phone: contactNumber,
        patient_name: patientName,
        blood_group: bloodGroup,
        hospital,
        hospital_address: hospitalAddress,
        city,
        quantity_units: Number(quantity),
        required_by: new Date(requiredDate).toISOString(),
        urgency,
        contact_number: contactNumber,
        notes,
        prescription_file_name: prescriptionFile?.name,
        prescription_file_url: prescriptionPreview || (prescriptionFile ? URL.createObjectURL(prescriptionFile) : undefined),
      });

      if (donor) {
        db.addNotification({
          user_id: donor.user_id,
          type: 'blood_request',
          title: `New Blood Request for ${bloodGroup}`,
          message: `${patientName} at ${hospital} has directly requested your assistance for ${quantity} unit(s).`,
          related_id: createdRequest.id,
          urgency,
        });
      }

      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setError('Failed to create blood request. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setError('');
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/80 flex items-center justify-center text-medical-red">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {donor ? `Request Blood from ${donor.name}` : 'Create Blood Request'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {donor ? `Target Blood Type: ${donor.blood_group} • ${donor.city}` : 'Broadcast to compatible nearby donors'}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Blood Request Broadcasted!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                {donor
                  ? `Your request has been delivered to ${donor.name}. You will be notified as soon as they accept.`
                  : 'Your request has been broadcasted to all active compatible donors in your area.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-sm shadow-md transition"
              >
                Track in Recipient Hub
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 overflow-y-auto pr-1">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Patient Name & Blood Group */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Aarav Mehta"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-medical-red focus:outline-none"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hospital & City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital Name *
                </label>
                <div className="relative">
                  <Hospital className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="e.g. AIIMS New Delhi / Apollo Hospital"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City / Location *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi / Mumbai / Bengaluru"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Units Required (Bags) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Urgency Level *
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className={`w-full px-2.5 py-2 text-xs rounded-xl border font-bold focus:outline-none ${
                    urgency === 'Critical'
                      ? 'border-red-400 bg-red-50 dark:bg-red-950/40 text-medical-red'
                      : urgency === 'Urgent'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <option value="Normal">Normal (Within 48h)</option>
                  <option value="Urgent">Urgent (Within 12-24h)</option>
                  <option value="Critical">Critical SOS (Immediate)</option>
                </select>
              </div>
            </div>

            {/* Contact & Required Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required By Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Medical Case Notes / Surgery Details
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Scheduled pediatric cardiac procedure. Replacement donors requested."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none resize-none"
              />
            </div>

            {/* Hospital Requisition / Prescription Document Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hospital Requisition / Doctor Prescription (Optional)
              </label>
              
              {!prescriptionFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all select-none ${
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
                  <div className="flex flex-col items-center space-y-1.5 py-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                      isDragging ? 'bg-medical-red text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isDragging ? 'Drop your file here' : 'Drop requisition / prescription here'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        or <span className="text-medical-red font-bold underline">browse local files</span> (JPG, PNG, PDF)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 flex items-center space-x-3">
                  {prescriptionPreview ? (
                    <img
                      src={prescriptionPreview}
                      alt="Prescription preview"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center text-medical-red">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {prescriptionFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {(prescriptionFile.size / 1024).toFixed(1)} KB • Attached from local files
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-white dark:hover:bg-slate-700"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Submit & Alert Donors</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
