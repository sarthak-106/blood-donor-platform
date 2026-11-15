// Types definition based on PRD Database & Business Rules

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'guest' | 'recipient' | 'donor' | 'hospital' | 'admin';

export type DonorAvailability =
  | 'Available'
  | 'Temporarily Unavailable'
  | 'Recently Donated'
  | 'Not Eligible'
  | 'Emergency-Only';

export type VerificationStatus = 'Unverified' | 'Pending' | 'Verified' | 'Rejected';

export type UrgencyLevel = 'Normal' | 'Urgent' | 'Critical';

export type RequestStatus =
  | 'Open'
  | 'Donor Contacted'
  | 'Donor Accepted'
  | 'In Progress'
  | 'Fulfilled'
  | 'Cancelled'
  | 'Expired';

export type DonorResponseStatus = 'Pending' | 'Accepted' | 'Declined' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profile_image?: string;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  blood_group: BloodGroup;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  city: string;
  area: string;
  pin_code: string;
  latitude: number;
  longitude: number;
  availability: DonorAvailability;
  last_donation_date?: string;
  total_donations: number;
  verification_status: VerificationStatus;
  rating: number;
  review_count: number;
  visibility: 'Public' | 'Hospital_Only' | 'Private';
  emergency_ready: boolean;
  badge_title?: string;
  response_rate_percent: number;
  avg_response_time: string;
  bio?: string;
  updated_at: string;
}

export type BloodComponent =
  | 'Whole Blood'
  | 'Platelets (PRP/SDP)'
  | 'Plasma (FFP)'
  | 'Packed Red Cells (PRBC)'
  | 'Cryoprecipitate';

export interface BloodRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_phone: string;
  requester_role?: UserRole;
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  blood_group: BloodGroup;
  component?: BloodComponent;
  hospital: string;
  hospital_address?: string;
  city: string;
  area?: string;
  pin_code?: string;
  quantity_units: number;
  required_by: string; // ISO date string
  urgency: UrgencyLevel;
  contact_number: string;
  notes?: string;
  prescription_file_name?: string;
  prescription_file_url?: string;
  status: RequestStatus;
  matched_donors_count?: number;
  contacted_donors_count?: number;
  accepted_donors_count?: number;
  is_emergency_sos?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DonorRequest {
  id: string;
  blood_request_id: string;
  donor_id: string;
  donor_name?: string;
  status: DonorResponseStatus;
  response_at?: string;
  decline_reason?: string;
  notes?: string;
  eta?: string;
  created_at: string;
}

export interface DonationHistory {
  id: string;
  donor_id: string;
  donation_date: string;
  location: string;
  hospital_or_blood_bank: string;
  units_donated: number;
  donation_type: 'Whole Blood' | 'Platelets' | 'Plasma' | 'Double Red Cells';
  notes?: string;
  certificate_url?: string;
  created_at: string;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  pin_code?: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  opening_hours: string;
  is_24x7: boolean;
  services: string[]; // e.g. ['Whole Blood', 'Platelet Apheresis', 'Plasma Storage', 'Cross-Matching']
  inventory: Record<BloodGroup, number>; // units available per blood group
  last_updated: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'emergency_sos' | 'blood_request' | 'request_accepted' | 'verification' | 'reminder' | 'system';
  title: string;
  message: string;
  read_at?: string | null;
  related_id?: string;
  urgency?: UrgencyLevel;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  donor_id: string;
  created_at: string;
}

export interface VerificationDocument {
  id: string;
  user_id: string;
  donor_id?: string;
  user_name: string;
  document_type: 'Government ID' | 'Blood Test Report' | 'Donor Card' | 'Medical Certificate';
  file_name: string;
  secure_file_reference: string;
  status: VerificationStatus;
  blood_group_claimed: BloodGroup;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface DonorAchievement {
  id: string;
  donor_id: string;
  achievement_id: string;
  awarded_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_user_id?: string;
  request_id?: string;
  reason: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Dismissed';
  resolution?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: 'donor' | 'blood_request' | 'verification' | 'user' | 'system' | 'blood_bank';
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_role: 'donor' | 'recipient';
  sender_alias: string;
  message: string;
  created_at: string;
}

export interface GratitudePost {
  id: string;
  author_name: string;
  recipient_city: string;
  patient_story: string;
  donor_alias?: string;
  blood_group: BloodGroup;
  component?: BloodComponent;
  units_received: number;
  likes: number;
  hospital: string;
  created_at: string;
}
