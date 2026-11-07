import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BloodGroup, UrgencyLevel, RequestStatus, VerificationStatus, DonorAvailability } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoDateString?: string): string {
  if (!isoDateString) return 'N/A';
  try {
    const d = new Date(isoDateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoDateString;
  }
}

export function formatDateTime(isoDateString?: string): string {
  if (!isoDateString) return 'N/A';
  try {
    const d = new Date(isoDateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDateString;
  }
}

export function formatTimeAgo(isoDateString?: string): string {
  if (!isoDateString) return 'just now';
  const now = new Date().getTime();
  const past = new Date(isoDateString).getTime();
  const diffMinutes = Math.floor((now - past) / (1000 * 60));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Privacy Helper: Formats full name into "First Name + Last Initial"
 * Example: "Sneha Reddy" -> "Sneha R.", "Rajesh Patel" -> "Rajesh P."
 */
export function formatPublicDonorName(fullName?: string): string {
  if (!fullName || typeof fullName !== 'string') return 'Anonymous Donor';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/**
 * Privacy Helper: Formats approximate neighborhood without exact house or street numbers
 */
export function formatApproximateArea(area?: string, city?: string): string {
  const parts: string[] = [];
  if (area) {
    // Strip specific house/flat/building numbers
    const cleanedArea = area.replace(/\b(?:flat|h\.no|house|plot|no\.|apt|room)\s*[\w\d\-#]+/gi, '').trim();
    if (cleanedArea) parts.push(cleanedArea);
  }
  if (city && (!area || !area.toLowerCase().includes(city.toLowerCase()))) {
    parts.push(city);
  }
  return parts.length > 0 ? parts.join(', ') : (city || 'India');
}

/**
 * Privacy Helper: Masks phone number on public display
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '+91 ••••• •••••';
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '+91 ••••• •••••';
  const lastFour = cleaned.slice(-4);
  return `+91 ••••• ••${lastFour}`;
}

export function getBloodBadgeStyle(bloodGroup: BloodGroup): { bg: string; text: string; border: string } {
  switch (bloodGroup) {
    case 'O-':
      return { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700' };
    case 'O+':
      return { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' };
    case 'A+':
      return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' };
    case 'A-':
      return { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700' };
    case 'B+':
      return { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' };
    case 'B-':
      return { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700' };
    case 'AB+':
      return { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' };
    case 'AB-':
      return { bg: 'bg-violet-600', text: 'text-white', border: 'border-violet-700' };
    default:
      return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' };
  }
}

export function getUrgencyBadgeStyle(urgency: UrgencyLevel): { bg: string; text: string; label: string } {
  switch (urgency) {
    case 'Critical':
      return { bg: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800', text: 'text-red-700 dark:text-red-300', label: 'Critical SOS' };
    case 'Urgent':
      return { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', label: 'Urgent' };
    case 'Normal':
    default:
      return { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', label: 'Normal' };
  }
}

export function getAvailabilityBadgeStyle(availability: DonorAvailability): { bg: string; text: string; dot: string } {
  switch (availability) {
    case 'Available':
      return { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500 animate-pulse' };
    case 'Emergency-Only':
      return { bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' };
    case 'Recently Donated':
      return { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-400' };
    case 'Temporarily Unavailable':
    case 'Not Eligible':
    default:
      return { bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-400' };
  }
}

export function getStatusBadgeStyle(status: RequestStatus): { bg: string; text: string } {
  switch (status) {
    case 'Open':
      return { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300', text: 'text-blue-700' };
    case 'Donor Contacted':
      return { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', text: 'text-amber-700' };
    case 'Donor Accepted':
    case 'In Progress':
      return { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300', text: 'text-purple-700' };
    case 'Fulfilled':
      return { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', text: 'text-emerald-700' };
    case 'Cancelled':
    case 'Expired':
    default:
      return { bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', text: 'text-gray-700' };
  }
}

export function getVerificationBadgeStyle(status: VerificationStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case 'Verified':
      return { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300', text: 'text-emerald-700', label: 'Verified Donor' };
    case 'Pending':
      return { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300', text: 'text-amber-700', label: 'Verification Pending' };
    case 'Rejected':
      return { bg: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300', text: 'text-red-700', label: 'Rejected' };
    case 'Unverified':
    default:
      return { bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300', text: 'text-gray-600', label: 'Unverified' };
  }
}
