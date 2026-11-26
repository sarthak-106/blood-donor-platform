'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Droplet, Heart, User, ArrowRight, ArrowLeft, ChevronDown,
  Phone, Mail, MapPin, Calendar, Loader2, CheckCircle2,
  AlertCircle, Eye, EyeOff, Upload, X, FileText, Shield, ShieldCheck,
  Hospital, Stethoscope, Sparkles, RefreshCw, KeyRound, Lock,
  Camera, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { CaptchaChallenge } from '@/components/ui/CaptchaChallenge';

// ─── Constants ───────────────────────────────────────────────────────────────

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

const INDIAN_HOSPITALS = [
  'AIIMS New Delhi', 'AIIMS Mumbai', 'AIIMS Bhopal',
  'Tata Memorial Hospital, Mumbai', 'Apollo Hospitals, Chennai',
  'Fortis Hospital, Gurgaon', 'Max Super Speciality Hospital, Delhi',
  'Safdarjung Hospital, New Delhi', 'KEM Hospital, Mumbai',
  'Manipal Hospital, Bengaluru', 'Lilavati Hospital, Mumbai',
  'Christian Medical College, Vellore', 'NIMHANS, Bengaluru',
  'PGIMER, Chandigarh', 'JIPMER, Puducherry',
];

const URGENCY_LEVELS = ['Normal', 'Urgent', 'Critical'] as const;
const RELATIONSHIP_OPTIONS = ['Self', 'Family Member', 'Friend', 'Other'];

type Step = 'role' | 'form' | 'otp' | 'success';
type Mode = 'register' | 'login' | 'forgot_password';
type Role = 'donor' | 'recipient';

// ─── Utility Functions ────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

function validatePhone(phone: string) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+\d{10,15}$/.test(cleaned) || /^\d{10}$/.test(cleaned) || /^0\d{10}$/.test(cleaned);
}

function validateEmail(email: string) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePinCode(pin: string) {
  return !pin || /^\d{6}$/.test(pin);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── Form Input Helper Components ─────────────────────────────────────────────

function InputField({
  label, required, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  cn(
    'w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none',
    'bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400',
    'focus:ring-2 focus:ring-red-500/30 focus:border-[#E53935]',
    hasError
      ? 'border-red-400 ring-2 ring-red-200 dark:ring-red-900'
      : 'border-slate-200 dark:border-slate-700'
  );

// ─── OTP Input Component ──────────────────────────────────────────────────────

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const newVal = [...value];
    newVal[idx] = val.slice(-1);
    onChange(newVal);
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newVal = [...value];
    for (let i = 0; i < 6; i++) newVal[i] = text[i] || '';
    onChange(newVal);
    refs[Math.min(text.length, 5)].current?.focus();
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={refs[idx]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${idx + 1}`}
          className={cn(
            'w-11 h-13 text-center font-mono font-black text-xl rounded-xl border-2 transition-all outline-none',
            'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
            'focus:border-[#E53935] focus:ring-2 focus:ring-red-500/20',
            value[idx]
              ? 'border-[#E53935] bg-red-50 dark:bg-red-950/30'
              : 'border-slate-200 dark:border-slate-700'
          )}
        />
      ))}
    </div>
  );
}

// ─── File Upload Component ────────────────────────────────────────────────────

function FileUpload({
  file, onFileChange, label, required, hint, error,
}: {
  file: File | null;
  onFileChange: (f: File | null) => void;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const validateAndSet = (f: File | null) => {
    setUploadError('');
    if (!f) { onFileChange(null); return; }
    if (!ALLOWED.includes(f.type)) {
      setUploadError('Only PDF, JPG, JPEG, or PNG files are allowed.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setUploadError('File size must be under 5 MB.');
      return;
    }
    onFileChange(f);
  };

  const displayError = error || uploadError;

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {file ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-800 dark:text-green-200 truncate">{file.name}</p>
            <p className="text-[11px] text-green-600">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = ''; }}
            className="p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-green-700" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            validateAndSet(e.dataTransfer.files[0] || null);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-[#E53935] bg-red-50 dark:bg-red-950/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-[#E53935]/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(e) => validateAndSet(e.target.files?.[0] || null)}
            aria-label={label}
          />
          <Upload className="w-7 h-7 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Drag & drop or click to upload
          </p>
          <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, JPEG, PNG · Max 5 MB</p>
        </div>
      )}

      {displayError && (
        <p className="flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle className="w-3 h-3" />
          {displayError}
        </p>
      )}
      {hint && !displayError && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

// ─── Donor Registration Form ──────────────────────────────────────────────────

function DonorForm({
  onNext,
  loading,
  serverError,
}: {
  onNext: (data: FormData) => void;
  loading: boolean;
  serverError: string;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [isRareBlood, setIsRareBlood] = useState(false);
  const [availability, setAvailability] = useState<'Available' | 'Temporarily Unavailable'>('Available');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [showHospitalList, setShowHospitalList] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [consent, setConsent] = useState(false);
  const [eligibilityAge, setEligibilityAge] = useState(true);
  const [eligibilityWeight, setEligibilityWeight] = useState(true);
  const [eligibilityGap, setEligibilityGap] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const filteredHospitals = INDIAN_HOSPITALS.filter((h) =>
    h.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  const validate = (fd: FormData) => {
    const errs: Record<string, string> = {};
    if (!fd.get('name')) errs.name = 'Full name is required.';
    if (!validatePhone(fd.get('phone') as string)) errs.phone = 'Enter a valid 10-digit mobile number or number with country code.';
    if (!fd.get('state')) errs.state = 'State is required.';
    if (!fd.get('city')) errs.city = 'City is required.';
    if (!validateEmail(fd.get('email') as string)) errs.email = 'Enter a valid email address.';
    if (!validatePinCode(fd.get('pin_code') as string)) errs.pin_code = 'PIN code must be 6 digits.';
    if (isRareBlood && !fd.get('rare_blood_type')) errs.rare_blood_type = 'Please describe your rare blood type.';
    if (!eligibilityAge || !eligibilityWeight || !eligibilityGap) {
      errs.eligibility = 'You must confirm that you meet all medical donor eligibility conditions (Age 18–65, weight 45 kg+, 90-day donation gap).';
    }
    if (!consent) errs.consent = 'You must agree to the terms and privacy policy.';
    if (!captchaAnswer.trim()) errs.captcha = 'Please solve the anti-spam verification challenge.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set('role', 'donor');
    fd.set('blood_group', bloodGroup);
    fd.set('availability', availability);
    fd.set('preferred_hospital', selectedHospital || hospitalSearch);
    if (profilePhoto) fd.set('profile_photo', profilePhoto);
    fd.set('consent', consent ? 'true' : '');
    fd.set('captcha_token', captchaToken);
    fd.set('captcha_answer', captchaAnswer);

    const errs = validate(fd);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext(fd);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
        <Heart className="w-4 h-4 text-[#E53935] flex-shrink-0" />
        <p className="text-[11px] text-red-700 dark:text-red-300 font-medium">
          Your donation could save up to 3 lives. Thank you for becoming a donor!
        </p>
      </div>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      {/* Personal Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Full Name" required error={errors.name}>
          <input name="name" type="text" placeholder="e.g. Rahul Sharma" className={inputCls(!!errors.name)} />
        </InputField>
        <InputField label="Phone Number" required error={errors.phone} hint="Include country code: +91">
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="phone" type="tel" placeholder="+91 98765 43210"
              className={cn(inputCls(!!errors.phone), 'pl-9')} />
          </div>
        </InputField>
      </div>

      <InputField label="Email Address (optional)" error={errors.email} hint="Will not be publicly visible">
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="email" type="email" placeholder="rahul.sharma@example.in"
            className={cn(inputCls(!!errors.email), 'pl-9')} />
        </div>
      </InputField>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField label="State" required error={errors.state}>
          <select name="state" className={cn(inputCls(!!errors.state), 'cursor-pointer')} defaultValue="">
            <option value="" disabled>Select State</option>
            {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </InputField>
        <InputField label="City" required error={errors.city}>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="city" type="text" placeholder="e.g. New Delhi"
              className={cn(inputCls(!!errors.city), 'pl-9')} />
          </div>
        </InputField>
        <InputField label="Area / PIN Code" error={errors.pin_code} hint="6-digit PIN">
          <input name="pin_code" type="text" inputMode="numeric" maxLength={6}
            placeholder="110001" className={inputCls(!!errors.pin_code)} />
        </InputField>
      </div>

      <InputField label="Area / Locality">
        <input name="area" type="text" placeholder="e.g. Saket, South Delhi" className={inputCls()} />
      </InputField>

      {/* Blood Group */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
          Blood Group <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => { setBloodGroup(bg); setIsRareBlood(false); }}
              className={cn(
                'py-2.5 rounded-xl text-xs font-black border-2 transition-all',
                bloodGroup === bg && !isRareBlood
                  ? 'bg-[#E53935] border-[#E53935] text-white shadow-md scale-105'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#E53935]/50'
              )}
            >
              {bg}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsRareBlood(!isRareBlood)}
          className={cn(
            'w-full py-2 rounded-xl text-xs font-semibold border-2 transition-all',
            isRareBlood
              ? 'bg-purple-50 border-purple-400 text-purple-700'
              : 'border-dashed border-slate-300 text-slate-500 hover:border-purple-400 hover:text-purple-600'
          )}
        >
          🧬 Other / Rare Blood Type
        </button>
        {isRareBlood && (
          <InputField label="Specify Rare Blood Type" required={isRareBlood} error={errors.rare_blood_type}
            hint="e.g. Bombay Blood Group (hh), Rh-null, Lutheran b-negative. May require clinical verification.">
            <input name="rare_blood_type" type="text" placeholder="Describe your rare blood type"
              className={inputCls(!!errors.rare_blood_type)} />
          </InputField>
        )}
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField label="Date of Birth" hint="Eligible age: 18–65 years">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              name="date_of_birth"
              type="date"
              max="2008-12-31"
              min="1955-01-01"
              style={{ colorScheme: 'light dark' }}
              className={cn(inputCls(), 'pl-9 cursor-pointer w-full')}
              onClick={(e) => {
                try {
                  (e.currentTarget as any).showPicker?.();
                } catch (_) {}
              }}
            />
          </div>
        </InputField>
        <InputField label="Gender">
          <select name="gender" className={cn(inputCls(), 'cursor-pointer')} defaultValue="">
            <option value="" disabled>Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </InputField>
        <InputField label="Donation Availability">
          <select
            className={cn(inputCls(), 'cursor-pointer')}
            value={availability}
            onChange={(e) => setAvailability(e.target.value as any)}
          >
            <option value="Available">✅ Available</option>
            <option value="Temporarily Unavailable">⏸️ Temporarily Unavailable</option>
          </select>
        </InputField>
      </div>

      {/* Preferred Hospital */}
      <InputField label="Preferred Hospital or Blood Donation Center"
        hint="Search by name or enter hospital manually if not listed">
        <div className="relative">
          <Hospital className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={selectedHospital || hospitalSearch}
            onChange={(e) => {
              setHospitalSearch(e.target.value);
              setSelectedHospital('');
              setShowHospitalList(true);
            }}
            onFocus={() => setShowHospitalList(true)}
            placeholder="Search hospital or type manually"
            className={cn(inputCls(), 'pl-9')}
          />
          {showHospitalList && hospitalSearch && filteredHospitals.length > 0 && !selectedHospital && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredHospitals.slice(0, 8).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => { setSelectedHospital(h); setHospitalSearch(''); setShowHospitalList(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-[#E53935] transition"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
      </InputField>

      {/* Donor Eligibility Checklist */}
      <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 space-y-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#E53935]" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Donor Health Eligibility Checklist (NBTC Standards)
          </h4>
        </div>
        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={eligibilityAge}
              onChange={(e) => setEligibilityAge(e.target.checked)}
              className="rounded text-[#E53935] focus:ring-[#E53935] h-4 w-4"
            />
            <span>I am aged between <strong>18 and 65 years</strong></span>
          </label>
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={eligibilityWeight}
              onChange={(e) => setEligibilityWeight(e.target.checked)}
              className="rounded text-[#E53935] focus:ring-[#E53935] h-4 w-4"
            />
            <span>My body weight is at least <strong>45 kg</strong></span>
          </label>
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={eligibilityGap}
              onChange={(e) => setEligibilityGap(e.target.checked)}
              className="rounded text-[#E53935] focus:ring-[#E53935] h-4 w-4"
            />
            <span>At least <strong>90 days (3 months)</strong> have passed since my last blood donation</span>
          </label>
        </div>
        {errors.eligibility && (
          <p className="flex items-center gap-1 text-[11px] text-red-500 pt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.eligibility}
          </p>
        )}
      </div>

      {/* Consent */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-[#E53935] border-slate-300 focus:ring-[#E53935]"
          />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            I confirm the provided medical details are accurate and grant explicit consent under DPDP guidelines to share my blood group and contact details with verified emergency patients and hospitals. I agree to the{' '}
            <a href="/privacy" target="_blank" className="text-[#E53935] underline font-semibold">Privacy Policy</a>{' '}
            and understand I can toggle my profile to Private at any time.
          </span>
        </label>
        {errors.consent && (
          <p className="flex items-center gap-1 text-[11px] text-red-500 ml-7">
            <AlertCircle className="w-3 h-3" />{errors.consent}
          </p>
        )}
      </div>

      <CaptchaChallenge
        onVerify={(tok, ans) => {
          setCaptchaToken(tok);
          setCaptchaAnswer(ans);
        }}
        error={errors.captcha}
      />

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2',
          loading
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-[#E53935] hover:bg-red-700 shadow-lg shadow-red-500/30 hover:scale-[1.01]'
        )}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Donor Account…</> : <>Create Donor Account <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}

// ─── Recipient Registration Form ──────────────────────────────────────────────

function RecipientForm({
  onNext,
  loading,
  serverError,
}: {
  onNext: (data: FormData) => void;
  loading: boolean;
  serverError: string;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bloodGroup, setBloodGroup] = useState('');
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Critical'>('Normal');
  const [reqFile, setReqFile] = useState<File | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const urgencyColors = {
    Normal: 'bg-green-50 border-green-300 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300',
    Urgent: 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300',
    Critical: 'bg-red-50 border-red-400 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300',
  };

  const validate = (fd: FormData) => {
    const errs: Record<string, string> = {};
    if (!fd.get('name')) errs.name = 'Full name of the recipient is required.';
    if (!validatePhone(fd.get('phone') as string)) errs.phone = 'Enter a valid 10-digit mobile number or number with country code.';
    if (!validateEmail(fd.get('email') as string)) errs.email = 'Enter a valid email address.';
    if (!bloodGroup) errs.blood_group = 'Required blood group is required.';
    const qty = Number(fd.get('quantity_units'));
    if (!qty || qty < 1 || qty > 50) errs.quantity_units = 'Enter a valid quantity (1–50 units).';
    if (!fd.get('hospital')) errs.hospital = 'Hospital name is required.';
    if (!fd.get('state')) errs.state = 'State is required.';
    if (!fd.get('city')) errs.city = 'City is required.';
    if (!fd.get('required_date')) errs.required_date = 'Required date and time is required.';
    if (!reqFile) {
      errs.request_document = 'Upload Blood Request Form is mandatory. Please attach a doctor requisition slip, prescription, or hospital letter.';
    }
    if (!captchaAnswer.trim()) {
      errs.captcha = 'Please solve the anti-spam verification challenge.';
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set('role', 'recipient');
    fd.set('blood_group', bloodGroup);
    fd.set('urgency', urgency);
    if (reqFile) fd.set('request_document', reqFile);
    fd.set('captcha_token', captchaToken);
    fd.set('captcha_answer', captchaAnswer);
    const errs = validate(fd);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext(fd);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
        <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
          We'll connect your request directly to nearby voluntary blood donors and blood banks.
        </p>
      </div>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      {/* Requester Info */}
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">1. Requester Information</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Full Name of the Recipient" required error={errors.name}>
          <input name="name" type="text" placeholder="e.g. Aarav Mehta" className={inputCls(!!errors.name)} />
        </InputField>
        <InputField label="Phone Number of the Requester" required error={errors.phone} hint="With country code (+91)">
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="phone" type="tel" placeholder="+91 98765 43210"
              className={cn(inputCls(!!errors.phone), 'pl-9')} />
          </div>
        </InputField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Optional Email Address" error={errors.email}>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="email" type="email" placeholder="contact@example.in"
              className={cn(inputCls(!!errors.email), 'pl-9')} />
          </div>
        </InputField>
        <InputField label="Relationship to Patient (optional)">
          <select name="relationship" className={cn(inputCls(), 'cursor-pointer')} defaultValue="">
            <option value="">Select relationship</option>
            {RELATIONSHIP_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </InputField>
      </div>

      {/* Blood Request Details */}
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800">
        2. Blood Request Details
      </p>

      {/* Blood Group */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
          Required Blood Group <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {[...BLOOD_GROUPS, 'Unknown / Not Sure'].map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setBloodGroup(bg)}
              className={cn(
                'py-2.5 rounded-xl text-xs font-black border-2 transition-all',
                bloodGroup === bg
                  ? 'bg-[#E53935] border-[#E53935] text-white shadow-md scale-105'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#E53935]/50'
              )}
            >
              {bg === 'Unknown / Not Sure' ? '❓ Not Sure' : bg}
            </button>
          ))}
        </div>
        {errors.blood_group && (
          <p className="flex items-center gap-1 text-[11px] text-red-500">
            <AlertCircle className="w-3 h-3" />{errors.blood_group}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Quantity (blood units required)" required error={errors.quantity_units} hint="1 unit ≈ 450 mL">
          <input name="quantity_units" type="number" min="1" max="50" defaultValue={1}
            className={inputCls(!!errors.quantity_units)} />
        </InputField>
        <InputField label="Required Date and Time" required error={errors.required_date}>
          <input name="required_date" type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            className={inputCls(!!errors.required_date)} />
        </InputField>
      </div>

      <InputField label="Hospital Name" required error={errors.hospital}>
        <div className="relative">
          <Hospital className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="hospital" type="text" placeholder="e.g. AIIMS New Delhi Trauma Centre"
            className={cn(inputCls(!!errors.hospital), 'pl-9')} />
        </div>
      </InputField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField label="Hospital State" required error={errors.state}>
          <select name="state" className={cn(inputCls(!!errors.state), 'cursor-pointer')} defaultValue="">
            <option value="" disabled>Select State</option>
            {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </InputField>
        <InputField label="Hospital City" required error={errors.city}>
          <input name="city" type="text" placeholder="e.g. New Delhi" className={inputCls(!!errors.city)} />
        </InputField>
        <InputField label="Area / PIN Code" error={errors.pin_code}>
          <input name="pin_code" type="text" inputMode="numeric" maxLength={6}
            placeholder="110029" className={inputCls(!!errors.pin_code)} />
        </InputField>
      </div>

      {/* Urgency */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Urgency Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {URGENCY_LEVELS.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUrgency(u)}
              className={cn(
                'py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all',
                urgency === u ? urgencyColors[u] + ' scale-105 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              )}
            >
              {u === 'Normal' ? '🟢' : u === 'Urgent' ? '🟡' : '🔴'} {u}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <InputField label="Additional Notes (optional)" hint="Any specific patient conditions or doctor instructions">
        <textarea
          name="notes"
          rows={3}
          placeholder="e.g. Scheduled surgery at 9:00 AM. Cross-matching requested."
          className={cn(inputCls(), 'resize-none')}
        />
      </InputField>

      {/* File Upload (Mandatory) */}
      <FileUpload
        file={reqFile}
        onFileChange={(f) => {
          setReqFile(f);
          if (f && errors.request_document) {
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.request_document;
              return updated;
            });
          }
        }}
        label="Upload Blood Request Form (Mandatory)"
        required={true}
        error={errors.request_document}
        hint="Upload doctor requisition slip or hospital certificate. Files are kept strictly confidential and accessible only to authorized medical reviewers."
      />

      <CaptchaChallenge
        onVerify={(tok, ans) => {
          setCaptchaToken(tok);
          setCaptchaAnswer(ans);
        }}
        error={errors.captcha}
      />

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2',
          loading
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-[#E53935] hover:bg-red-700 shadow-lg shadow-red-500/30 hover:scale-[1.01]'
        )}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Blood Request…</> : <>Submit Blood Request <ArrowRight className="w-4 h-4" /></>}
      </button>

      <p className="text-[11px] text-slate-400 text-center px-4">
        Submitting a blood request does not guarantee donor or blood unit availability. We will mobilize matching donors in your area immediately.
      </p>
    </form>
  );
}

// ─── Sign In Form (Supports Phone OTP & Email/Password) ───────────────────────

function SignInForm({
  onSuccess, onSwitch,
}: {
  onSuccess: (role: string) => void;
  onSwitch: () => void;
}) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [gatewayConfigured, setGatewayConfigured] = useState(true);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const formatPhoneNumber = (val: string) => {
    const cleaned = val.replace(/[\s\-\(\)]/g, '').trim();
    if (/^\d{10}$/.test(cleaned)) {
      return '+91' + cleaned;
    }
    if (/^0\d{10}$/.test(cleaned)) {
      return '+91' + cleaned.substring(1);
    }
    return cleaned;
  };

  const sendOtp = async () => {
    setError('');
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit mobile number or number with country code (e.g. 98765 43210).');
      return;
    }
    const targetPhone = formatPhoneNumber(phone);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      if (data.gatewayConfigured !== undefined) {
        setGatewayConfigured(data.gatewayConfigured);
      }
      setOtpSent(true);
      setTimer(60);
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndLogin = async () => {
    setError('');
    const otp = otpDigits.join('');
    if (otp.length < 6) { setError('Please enter the full 6-digit OTP.'); return; }

    const targetPhone = formatPhoneNumber(phone);
    setLoading(true);
    try {
      const verifyRes = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) { setError(verifyData.error); return; }

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone }),
      });
      const loginData = await loginRes.json();
      if (!loginData.success) { setError(loginData.error); return; }

      if (loginData.user?.id && typeof window !== 'undefined') {
        localStorage.setItem('blood_donor_auth_user_id', loginData.user.id);
      }

      onSuccess(loginData.role);
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Sign In to LifeLink</h2>
        <p className="text-xs text-slate-500">Fast & secure authentication via Phone OTP</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {!otpSent ? (
        <div className="space-y-4">
          <InputField label="Mobile Phone Number" required hint="Enter your 10-digit mobile number">
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210 or +91 98765 43210"
                className={cn(inputCls(), 'pl-9 text-base font-medium')}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                autoFocus
              />
            </div>
          </InputField>

          <button
            type="button"
            onClick={sendOtp}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…
              </>
            ) : (
              <>
                Send Verification OTP <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-[#E53935] flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Verify Your Mobile Number</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A 6-digit verification code has been dispatched via SMS to:
              </p>
              <p className="text-sm font-black text-red-600 dark:text-red-400 font-mono mt-0.5">
                {formatPhoneNumber(phone)}
              </p>
            </div>

            {!gatewayConfigured && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-left space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <span>⚠️ SMS Provider Not Connected</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Real cellular SMS delivery requires an SMS Gateway API key (Fast2SMS or Twilio) configured in Vercel environment variables.
                </p>
                <div className="flex items-center justify-between bg-amber-100/70 dark:bg-amber-900/40 px-2.5 py-1.5 rounded-lg border border-amber-300/60 dark:border-amber-700/60">
                  <span className="text-[11px] text-amber-900 dark:text-amber-200 font-medium">Bypass code for testing:</span>
                  <span className="font-mono font-black text-amber-900 dark:text-amber-100 text-xs tracking-wider">123456</span>
                </div>
              </div>
            )}
          </div>

          <OtpInput value={otpDigits} onChange={setOtpDigits} />

          <button
            type="button"
            onClick={verifyAndLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
              </>
            ) : (
              <>
                Verify & Sign In <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtpDigits(['', '', '', '', '', '']);
              }}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3 h-3" /> Change number
            </button>
            {timer > 0 ? (
              <span className="text-slate-400 font-mono">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                className="text-[#E53935] font-bold flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-[#E53935] font-bold hover:underline">
          Create an account
        </button>
      </p>
    </div>
  );
}

// ─── Main Auth Page Content ───────────────────────────────────────────────────

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as Mode) || 'register';
  const initialRole = (searchParams.get('role') as Role) || null;

  const { register: localRegister } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>(initialRole ? 'form' : 'role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(initialRole);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successData, setSuccessData] = useState<{
    refNumber?: string;
    role?: string;
    name?: string;
  } | null>(null);

  // Registration OTP state
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpDigits, setRegOtpDigits] = useState(['', '', '', '', '', '']);
  const [regTimer, setRegTimer] = useState(0);
  const [regOtpError, setRegOtpError] = useState('');
  const [gatewayConfigured, setGatewayConfigured] = useState(true);

  useEffect(() => {
    if (regTimer > 0) {
      const t = setTimeout(() => setRegTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [regTimer]);

  const formatPhoneNumber = (val: string) => {
    const cleaned = val.replace(/[\s\-\(\)]/g, '').trim();
    if (/^\d{10}$/.test(cleaned)) {
      return '+91' + cleaned;
    }
    if (/^0\d{10}$/.test(cleaned)) {
      return '+91' + cleaned.substring(1);
    }
    return cleaned;
  };

  const sendRegistrationOtp = async (phone: string) => {
    const targetPhone = formatPhoneNumber(phone);
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: targetPhone }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    if (data.gatewayConfigured !== undefined) {
      setGatewayConfigured(data.gatewayConfigured);
    }
    setRegTimer(60);
    setRegOtpSent(true);
  };

  const handleFormNext = async (fd: FormData) => {
    setLoading(true);
    setServerError('');
    try {
      const rawPhone = (fd.get('phone') as string) || '';
      const formattedPhone = formatPhoneNumber(rawPhone);
      fd.set('phone', formattedPhone);
      await sendRegistrationOtp(formattedPhone);
      setPendingFormData(fd);
      setStep('otp');
    } catch (e: any) {
      setServerError(e.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterConfirm = async () => {
    const otp = regOtpDigits.join('');
    if (otp.length < 6) { setRegOtpError('Please enter the full 6-digit verification code.'); return; }
    if (!pendingFormData) return;

    setLoading(true);
    setRegOtpError('');

    try {
      const rawPhone = (pendingFormData.get('phone') as string) || '';
      const phone = formatPhoneNumber(rawPhone);

      // Verify OTP first
      const verifyRes = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) { setRegOtpError(verifyData.error); return; }

      // Register with backend database
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        body: pendingFormData,
      });
      const regData = await regRes.json();
      if (!regData.success) {
        setRegOtpError(regData.error);
        return;
      }

      // Update local auth context
      const name = pendingFormData.get('name') as string;
      const email = pendingFormData.get('email') as string;
      const role = pendingFormData.get('role') as string;
      const bloodGroup = pendingFormData.get('blood_group') as string;
      const city = pendingFormData.get('city') as string;
      const area = pendingFormData.get('area') as string;
      const pinCode = pendingFormData.get('pin_code') as string;

      localRegister(
        { id: regData.userId, name, email, phone, role: role as any },
        role === 'donor' ? { user_id: regData.userId, blood_group: bloodGroup as any, city, area, pin_code: pinCode, emergency_ready: true } : undefined
      );

      if (regData.userId && typeof window !== 'undefined') {
        localStorage.setItem('blood_donor_auth_user_id', regData.userId);
      }

      setSuccessData({
        refNumber: regData.refNumber || `BDP-${Date.now().toString(36).toUpperCase()}`,
        role,
        name,
      });
      setStep('success');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } catch (e: any) {
      setRegOtpError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (role: string) => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    setTimeout(() => {
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'donor') router.push('/donor/dashboard');
      else router.push('/recipient/dashboard');
    }, 400);
  };

  const handleSuccessRedirect = () => {
    const role = successData?.role;
    if (role === 'donor') router.push('/donor/dashboard');
    else if (role === 'admin') router.push('/admin/dashboard');
    else router.push('/recipient/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#E53935] text-white flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
            <Droplet className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Blood<span className="text-[#E53935]">Donor</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">India's Verified Blood Donor Network</p>
          </div>
        </div>

        {/* Tab switcher: Register / Sign In */}
        {step === 'role' || step === 'form' ? (
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
            {(['register', 'login'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setStep('role'); setSelectedRole(null); setServerError(''); }}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {m === 'register' ? '✨ Create Account' : '🔐 Sign In'}
              </button>
            ))}
          </div>
        ) : null}

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 animate-fadeIn">

          {/* ── SIGN IN MODE ── */}
          {mode === 'login' && step === 'role' && (
            <SignInForm onSuccess={handleLoginSuccess} onSwitch={() => setMode('register')} />
          )}

          {/* ── STEP: ROLE SELECTION ── */}
          {mode === 'register' && step === 'role' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Join the Network</h2>
                <p className="text-xs text-slate-500">Select how you want to use the platform</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Donor Option */}
                <button
                  type="button"
                  onClick={() => { setSelectedRole('donor'); setStep('form'); }}
                  className={cn(
                    'group relative p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99]',
                    selectedRole === 'donor'
                      ? 'border-[#E53935] bg-red-50 dark:bg-red-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#E53935]/60 hover:bg-red-50/50 dark:hover:bg-red-950/10'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#E53935] flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base">Become a Donor</h3>
                      <p className="text-xs text-slate-500 mt-0.5">“I want to help save lives by donating blood.”</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Free Registration', 'Verified Profile', 'Emergency Alerts'].map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-full font-semibold">{t}</span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#E53935] mt-1 ml-auto flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>

                {/* Recipient Option */}
                <button
                  type="button"
                  onClick={() => { setSelectedRole('recipient'); setStep('form'); }}
                  className={cn(
                    'group relative p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99]',
                    selectedRole === 'recipient'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base">I'm a Recipient</h3>
                      <p className="text-xs text-slate-500 mt-0.5">“I need blood for myself or someone else.”</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Fast Donor Matching', 'Hospital Direct', 'Sensitive Document Safe'].map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full font-semibold">{t}</span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 mt-1 ml-auto flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              </div>

              <p className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-[#E53935] font-bold hover:underline">
                  Sign in here
                </button>
              </p>
            </div>
          )}

          {/* ── STEP: FORM ── */}
          {mode === 'register' && step === 'form' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setStep('role'); setServerError(''); }}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                  <h2 className="font-black text-slate-900 dark:text-white text-base">
                    {selectedRole === 'donor' ? '🩸 Donor Registration' : '🏥 Blood Request'}
                  </h2>
                  <p className="text-xs text-slate-500">Enter details to complete registration</p>
                </div>
              </div>

              {selectedRole === 'donor' ? (
                <DonorForm onNext={handleFormNext} loading={loading} serverError={serverError} />
              ) : (
                <RecipientForm onNext={handleFormNext} loading={loading} serverError={serverError} />
              )}
            </div>
          )}

          {/* ── STEP: OTP VERIFICATION ── */}
          {mode === 'register' && step === 'otp' && (
            <div className="space-y-5 text-center">
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/80 text-[#E53935] flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Verify Phone Number</h2>
                <p className="text-xs text-slate-500">
                  A 6-digit verification code has been dispatched via SMS to:
                </p>
                <p className="text-sm font-black text-red-600 dark:text-red-400 font-mono">
                  {(pendingFormData?.get('phone') as string) || ''}
                </p>
                <p className="text-[11px] text-slate-400">
                  Please enter the code below to confirm and activate your registration.
                </p>

                {!gatewayConfigured && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-left space-y-1.5 text-xs max-w-sm mx-auto">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                      <span>⚠️ SMS Provider Not Connected</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      Real cellular SMS delivery requires an SMS Gateway API key (Fast2SMS or Twilio) configured in Vercel environment variables.
                    </p>
                    <div className="flex items-center justify-between bg-amber-100/70 dark:bg-amber-900/40 px-2.5 py-1.5 rounded-lg border border-amber-300/60 dark:border-amber-700/60">
                      <span className="text-[11px] text-amber-900 dark:text-amber-200 font-medium">Bypass code for testing:</span>
                      <span className="font-mono font-black text-amber-900 dark:text-amber-100 text-xs tracking-wider">123456</span>
                    </div>
                  </div>
                )}
              </div>

              {regOtpError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {regOtpError}
                </div>
              )}

              <OtpInput value={regOtpDigits} onChange={setRegOtpDigits} />

              <button
                type="button"
                onClick={handleRegisterConfirm}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying & Activating…</>
                  : <><CheckCircle2 className="w-4 h-4" /> Confirm & Activate Account</>
                }
              </button>

              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setStep('form'); setRegOtpDigits(['', '', '', '', '', '']); }}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-semibold">
                  <ArrowLeft className="w-3 h-3" /> Go back
                </button>
                {regTimer > 0 ? (
                  <span className="text-slate-400 font-mono">Resend in {regTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const phone = (pendingFormData?.get('phone') as string) || '';
                        await sendRegistrationOtp(phone);
                        setRegOtpDigits(['', '', '', '', '', '']);
                        setRegOtpError('');
                      } catch (e: any) {
                        setRegOtpError(e.message);
                      }
                    }}
                    className="text-[#E53935] font-bold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && successData && (
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/80 text-green-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {successData.role === 'donor' ? '🎉 Welcome to the Donor Network!' : '✅ Blood Request Submitted!'}
                </h2>
                <p className="text-sm text-slate-500">
                  {successData.role === 'donor'
                    ? `Thank you, ${successData.name || 'Donor'}! Your account is active. Our clinical coordinators verify voluntary donor details within 24–48 hours.`
                    : `Your request has been registered. Reference number generated below for tracking.`}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-1.5 text-left border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Request Reference Number</p>
                <p className="font-mono font-black text-lg text-[#E53935]">{successData.refNumber}</p>
                <p className="text-[11px] text-slate-400">Save this reference ID to track donor responses and hospital dispatch.</p>
              </div>

              {successData.role === 'donor' ? (
                <div className="grid grid-cols-1 gap-2 text-xs text-left">
                  {[
                    { icon: '📱', text: 'Phone verified — your donor account is officially registered.' },
                    { icon: '🏥', text: 'You will receive priority emergency SOS alerts for matching patients nearby.' },
                    { icon: '🎖️', text: 'Complete your donor history to unlock verified badges.' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-base leading-none flex-shrink-0">{icon}</span>
                      <span className="text-slate-600 dark:text-slate-400">{text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 text-left">
                  ⚠️ Note: Blood unit availability cannot be 100% guaranteed. Our emergency coordination system contacts nearby registered donors and blood centers immediately.
                </div>
              )}

              <button
                type="button"
                onClick={handleSuccessRedirect}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#E53935] hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          🔒 Encrypted & compliant with National Blood Transfusion Council (NBTC) & DPDP Act 2023.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#E53935]" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
