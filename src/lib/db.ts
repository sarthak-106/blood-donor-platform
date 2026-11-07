import {
  User,
  Donor,
  BloodRequest,
  DonorRequest,
  BloodBank,
  Notification,
  Favorite,
  VerificationDocument,
  Achievement,
  DonorAchievement,
  DonationHistory,
  AuditLog,
  BloodGroup,
  DonorAvailability,
  VerificationStatus,
  RequestStatus,
} from './types';
import {
  SEED_USERS,
  SEED_DONORS,
  SEED_BLOOD_REQUESTS,
  SEED_BLOOD_BANKS,
  SEED_ACHIEVEMENTS,
  SEED_DONOR_ACHIEVEMENTS,
  SEED_VERIFICATION_DOCUMENTS,
  SEED_NOTIFICATIONS,
  SEED_DONATION_HISTORY,
  SEED_AUDIT_LOGS,
} from './seedData';
import { getCompatibleDonorGroups } from './compatibility';

interface DBState {
  users: User[];
  donors: Donor[];
  bloodRequests: BloodRequest[];
  donorRequests: DonorRequest[];
  bloodBanks: BloodBank[];
  notifications: Notification[];
  favorites: Favorite[];
  verificationDocuments: VerificationDocument[];
  achievements: Achievement[];
  donorAchievements: DonorAchievement[];
  donationHistory: DonationHistory[];
  auditLogs: AuditLog[];
}

const STORAGE_KEY = 'blood_donor_platform_db_v2';

class DatabaseEngine {
  private state: DBState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): DBState {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load DB state from localStorage', e);
      }
    }
    return {
      users: [],
      donors: [...SEED_DONORS],
      bloodRequests: [],
      donorRequests: [],
      bloodBanks: [...SEED_BLOOD_BANKS],
      notifications: [],
      favorites: [],
      verificationDocuments: [],
      achievements: [...SEED_ACHIEVEMENTS],
      donorAchievements: [],
      donationHistory: [],
      auditLogs: [],
    };
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to persist DB state to localStorage', e);
      }
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return this.state.users;
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Anonymous User',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || 'recipient',
      verification_status: userData.verification_status || 'Unverified',
      profile_image:
        userData.profile_image ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || 'User')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.users.unshift(newUser);
    this.addAuditLog(newUser.id, newUser.name, 'REGISTER_USER', 'user', newUser.id);
    this.persist();
    return newUser;
  }

  // --- Donors ---
  getDonors(filters?: {
    bloodGroup?: BloodGroup;
    includeCompatible?: boolean;
    city?: string;
    availability?: DonorAvailability | 'all';
    verifiedOnly?: boolean;
    emergencyReadyOnly?: boolean;
    searchQuery?: string;
  }): Donor[] {
    let result = this.state.donors.filter((d) => d.visibility !== 'Private');

    if (filters) {
      if (filters.bloodGroup) {
        if (filters.includeCompatible) {
          const compatibleTypes = getCompatibleDonorGroups(filters.bloodGroup);
          result = result.filter((d) => compatibleTypes.includes(d.blood_group));
        } else {
          result = result.filter((d) => d.blood_group === filters.bloodGroup);
        }
      }

      if (filters.city && filters.city !== 'All Cities') {
        result = result.filter((d) => d.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }

      if (filters.availability && filters.availability !== 'all') {
        result = result.filter((d) => d.availability === filters.availability);
      }

      if (filters.verifiedOnly) {
        result = result.filter((d) => d.verification_status === 'Verified');
      }

      if (filters.emergencyReadyOnly) {
        result = result.filter((d) => d.emergency_ready || d.availability === 'Emergency-Only');
      }

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.area.toLowerCase().includes(q) ||
            d.city.toLowerCase().includes(q) ||
            d.pin_code.includes(q) ||
            d.blood_group.toLowerCase().includes(q)
        );
      }
    }

    return result;
  }

  getDonorById(id: string): Donor | undefined {
    return this.state.donors.find((d) => d.id === id);
  }

  getDonorByUserId(userId: string): Donor | undefined {
    return this.state.donors.find((d) => d.user_id === userId);
  }

  createDonor(donorData: Partial<Donor>): Donor {
    const newDonor: Donor = {
      id: `donor-${Date.now()}`,
      user_id: donorData.user_id || `user-${Date.now()}`,
      name: donorData.name || 'Anonymous Donor',
      email: donorData.email,
      phone: donorData.phone,
      blood_group: donorData.blood_group || 'O+',
      date_of_birth: donorData.date_of_birth || '1995-01-01',
      gender: donorData.gender || 'Other',
      city: donorData.city || 'New York',
      area: donorData.area || 'Downtown',
      pin_code: donorData.pin_code || '10001',
      latitude: donorData.latitude || 40.7128,
      longitude: donorData.longitude || -74.006,
      availability: donorData.availability || 'Available',
      total_donations: donorData.total_donations || 0,
      verification_status: donorData.verification_status || 'Pending',
      rating: 5.0,
      review_count: 0,
      visibility: donorData.visibility || 'Public',
      emergency_ready: donorData.emergency_ready ?? true,
      badge_title: 'New Registered Donor',
      response_rate_percent: 100,
      avg_response_time: '15 mins',
      bio: donorData.bio || 'Willing to help patients in emergency need.',
      updated_at: new Date().toISOString(),
    };
    this.state.donors.unshift(newDonor);
    this.addAuditLog(newDonor.user_id, newDonor.name, 'REGISTER_DONOR', 'donor', newDonor.id);
    this.persist();
    return newDonor;
  }

  updateDonorAvailability(donorId: string, availability: DonorAvailability): Donor | undefined {
    const donor = this.state.donors.find((d) => d.id === donorId);
    if (donor) {
      donor.availability = availability;
      donor.updated_at = new Date().toISOString();
      this.addAuditLog(donor.user_id, donor.name, 'UPDATE_AVAILABILITY', 'donor', donor.id, {
        availability,
      });
      this.persist();
    }
    return donor;
  }

  updateDonor(donorId: string, updates: Partial<Donor>): Donor | undefined {
    const index = this.state.donors.findIndex((d) => d.id === donorId);
    if (index !== -1) {
      this.state.donors[index] = {
        ...this.state.donors[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.persist();
      return this.state.donors[index];
    }
    return undefined;
  }

  deleteDonor(donorId: string): boolean {
    const initialLen = this.state.donors.length;
    this.state.donors = this.state.donors.filter((d) => d.id !== donorId);
    if (this.state.donors.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Blood Requests & Emergency SOS ---
  getBloodRequests(filters?: {
    bloodGroup?: BloodGroup;
    urgency?: string;
    status?: RequestStatus;
    city?: string;
    requesterId?: string;
  }): BloodRequest[] {
    let result = [...this.state.bloodRequests];

    if (filters) {
      if (filters.bloodGroup) {
        result = result.filter((r) => r.blood_group === filters.bloodGroup);
      }
      if (filters.urgency) {
        result = result.filter((r) => r.urgency === filters.urgency);
      }
      if (filters.status) {
        result = result.filter((r) => r.status === filters.status);
      }
      if (filters.city) {
        result = result.filter((r) => r.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }
      if (filters.requesterId) {
        result = result.filter((r) => r.requester_id === filters.requesterId);
      }
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getBloodRequestById(id: string): BloodRequest | undefined {
    return this.state.bloodRequests.find((r) => r.id === id);
  }

  createBloodRequest(requestData: Partial<BloodRequest>): BloodRequest {
    const isEmergency = requestData.urgency === 'Critical' || requestData.is_emergency_sos;
    const compatibleGroups = getCompatibleDonorGroups(requestData.blood_group || 'O+');
    
    // Count matching donors in the system
    const matchedDonors = this.state.donors.filter(
      (d) =>
        compatibleGroups.includes(d.blood_group) &&
        (d.availability === 'Available' || d.availability === 'Emergency-Only')
    );

    const newRequest: BloodRequest = {
      id: `req-${isEmergency ? 'sos' : 'std'}-${Date.now()}`,
      requester_id: requestData.requester_id || 'user-recipient-1',
      requester_name: requestData.requester_name || 'Requester',
      requester_phone: requestData.requester_phone || '+1 (555) 000-0000',
      requester_role: requestData.requester_role || 'recipient',
      patient_name: requestData.patient_name || 'Patient',
      patient_age: requestData.patient_age,
      patient_gender: requestData.patient_gender,
      blood_group: requestData.blood_group || 'O+',
      hospital: requestData.hospital || 'General Hospital',
      hospital_address: requestData.hospital_address,
      city: requestData.city || 'New York',
      area: requestData.area || 'Metro Area',
      pin_code: requestData.pin_code,
      quantity_units: requestData.quantity_units || 1,
      required_by: requestData.required_by || new Date(Date.now() + 86400000).toISOString(),
      urgency: requestData.urgency || (isEmergency ? 'Critical' : 'Normal'),
      contact_number: requestData.contact_number || requestData.requester_phone || '+1 (555) 000-0000',
      notes: requestData.notes || '',
      prescription_file_name: requestData.prescription_file_name,
      prescription_file_url: requestData.prescription_file_url,
      status: 'Open',
      matched_donors_count: matchedDonors.length,
      contacted_donors_count: 0,
      accepted_donors_count: 0,
      is_emergency_sos: isEmergency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.bloodRequests.unshift(newRequest);

    // If emergency, broadcast notifications to all matching donors
    if (isEmergency) {
      matchedDonors.slice(0, 10).forEach((donor) => {
        this.addNotification({
          user_id: donor.user_id,
          type: 'emergency_sos',
          title: `EMERGENCY SOS: ${newRequest.blood_group} Needed Immediately!`,
          message: `${newRequest.hospital} urgently requires ${newRequest.quantity_units} unit(s) of ${newRequest.blood_group} for patient ${newRequest.patient_name}.`,
          related_id: newRequest.id,
          urgency: 'Critical',
        });
      });
    }

    this.addAuditLog(
      newRequest.requester_id,
      newRequest.requester_name,
      isEmergency ? 'BROADCAST_EMERGENCY_SOS' : 'CREATE_BLOOD_REQUEST',
      'blood_request',
      newRequest.id,
      { blood_group: newRequest.blood_group, hospital: newRequest.hospital }
    );

    this.persist();
    return newRequest;
  }

  updateBloodRequestStatus(id: string, status: RequestStatus): BloodRequest | undefined {
    const request = this.state.bloodRequests.find((r) => r.id === id);
    if (request) {
      request.status = status;
      request.updated_at = new Date().toISOString();
      this.addAuditLog(request.requester_id, request.requester_name, 'UPDATE_REQUEST_STATUS', 'blood_request', id, {
        status,
      });
      this.persist();
    }
    return request;
  }

  // --- Donor Requests & Responses ---
  getDonorRequestsByDonor(donorId: string): DonorRequest[] {
    return this.state.donorRequests.filter((dr) => dr.donor_id === donorId);
  }

  respondToDonorRequest(
    bloodRequestId: string,
    donorId: string,
    action: 'accept' | 'decline',
    details?: { eta?: string; notes?: string; decline_reason?: string }
  ): DonorRequest {
    const donor = this.getDonorById(donorId);
    const bloodReq = this.getBloodRequestById(bloodRequestId);

    let existing = this.state.donorRequests.find(
      (dr) => dr.blood_request_id === bloodRequestId && dr.donor_id === donorId
    );

    if (!existing) {
      existing = {
        id: `dreq-${Date.now()}`,
        blood_request_id: bloodRequestId,
        donor_id: donorId,
        donor_name: donor?.name || 'Voluntary Donor',
        status: action === 'accept' ? 'Accepted' : 'Declined',
        response_at: new Date().toISOString(),
        eta: details?.eta,
        notes: details?.notes,
        decline_reason: details?.decline_reason,
        created_at: new Date().toISOString(),
      };
      this.state.donorRequests.push(existing);
    } else {
      existing.status = action === 'accept' ? 'Accepted' : 'Declined';
      existing.response_at = new Date().toISOString();
      existing.eta = details?.eta;
      existing.notes = details?.notes;
      existing.decline_reason = details?.decline_reason;
    }

    if (bloodReq) {
      if (action === 'accept') {
        bloodReq.status = 'Donor Accepted';
        bloodReq.accepted_donors_count = (bloodReq.accepted_donors_count || 0) + 1;

        // Notify requester
        this.addNotification({
          user_id: bloodReq.requester_id,
          type: 'request_accepted',
          title: `Donor Accepted Your Request!`,
          message: `${donor?.name || 'A verified donor'} (${donor?.blood_group}) accepted your request for ${bloodReq.hospital}. ETA: ${details?.eta || 'Within 1 hour'}.`,
          related_id: bloodReq.id,
          urgency: 'Urgent',
        });
      }
      bloodReq.updated_at = new Date().toISOString();
    }

    if (donor) {
      this.addAuditLog(donor.user_id, donor.name, action === 'accept' ? 'ACCEPT_REQUEST' : 'DECLINE_REQUEST', 'blood_request', bloodRequestId, {
        eta: details?.eta,
      });
    }

    this.persist();
    return existing;
  }

  // --- Blood Banks ---
  getBloodBanks(city?: string): BloodBank[] {
    if (city && city !== 'All Cities') {
      return this.state.bloodBanks.filter((b) => b.city.toLowerCase().includes(city.toLowerCase()));
    }
    return this.state.bloodBanks;
  }

  getBloodBankById(id: string): BloodBank | undefined {
    return this.state.bloodBanks.find((b) => b.id === id);
  }

  updateBloodBankInventory(id: string, inventory: Record<BloodGroup, number>): BloodBank | undefined {
    const bank = this.state.bloodBanks.find((b) => b.id === id);
    if (bank) {
      bank.inventory = inventory;
      bank.last_updated = new Date().toISOString();
      this.persist();
    }
    return bank;
  }

  // --- Favorites ---
  getFavoritesByUser(userId: string): Donor[] {
    const favDonorIds = this.state.favorites.filter((f) => f.user_id === userId).map((f) => f.donor_id);
    return this.state.donors.filter((d) => favDonorIds.includes(d.id));
  }

  isFavorite(userId: string, donorId: string): boolean {
    return this.state.favorites.some((f) => f.user_id === userId && f.donor_id === donorId);
  }

  toggleFavorite(userId: string, donorId: string): boolean {
    const index = this.state.favorites.findIndex((f) => f.user_id === userId && f.donor_id === donorId);
    let isNowFav = false;
    if (index !== -1) {
      this.state.favorites.splice(index, 1);
      isNowFav = false;
    } else {
      this.state.favorites.push({
        id: `fav-${Date.now()}`,
        user_id: userId,
        donor_id: donorId,
        created_at: new Date().toISOString(),
      });
      isNowFav = true;
    }
    this.persist();
    return isNowFav;
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.state.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addNotification(notifData: Partial<Notification>): Notification {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: notifData.user_id || 'user-recipient-1',
      type: notifData.type || 'system',
      title: notifData.title || 'Platform Notification',
      message: notifData.message || '',
      read_at: null,
      related_id: notifData.related_id,
      urgency: notifData.urgency || 'Normal',
      created_at: new Date().toISOString(),
    };
    this.state.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  markNotificationAsRead(id: string): void {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read_at = new Date().toISOString();
      this.persist();
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    const now = new Date().toISOString();
    this.state.notifications.forEach((n) => {
      if (n.user_id === userId && !n.read_at) {
        n.read_at = now;
      }
    });
    this.persist();
  }

  // --- Verification Documents & Admin Queue ---
  getVerificationDocuments(status?: VerificationStatus): VerificationDocument[] {
    if (status) {
      return this.state.verificationDocuments.filter((d) => d.status === status);
    }
    return this.state.verificationDocuments;
  }

  submitVerificationDocument(docData: Partial<VerificationDocument>): VerificationDocument {
    const newDoc: VerificationDocument = {
      id: `doc-${Date.now()}`,
      user_id: docData.user_id || 'user-donor-1',
      donor_id: docData.donor_id,
      user_name: docData.user_name || 'Donor',
      document_type: docData.document_type || 'Blood Test Report',
      file_name: docData.file_name || 'blood_report.pdf',
      secure_file_reference:
        docData.secure_file_reference || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600',
      status: 'Pending',
      blood_group_claimed: docData.blood_group_claimed || 'O+',
      created_at: new Date().toISOString(),
    };
    this.state.verificationDocuments.unshift(newDoc);
    this.persist();
    return newDoc;
  }

  reviewVerificationDocument(
    docId: string,
    decision: 'Verified' | 'Rejected',
    reviewerId: string,
    rejectionReason?: string
  ): VerificationDocument | undefined {
    const doc = this.state.verificationDocuments.find((d) => d.id === docId);
    if (doc) {
      doc.status = decision;
      doc.reviewed_by = reviewerId;
      doc.reviewed_at = new Date().toISOString();
      doc.rejection_reason = rejectionReason;

      // Update donor verification status
      if (doc.donor_id) {
        const donor = this.getDonorById(doc.donor_id);
        if (donor) {
          donor.verification_status = decision;
          if (decision === 'Verified') {
            donor.blood_group = doc.blood_group_claimed;
            this.addNotification({
              user_id: donor.user_id,
              type: 'verification',
              title: 'Verification Approved! 🎉',
              message: 'Your blood test documents have been verified. You are now a Verified Donor!',
              urgency: 'Normal',
            });
          } else {
            this.addNotification({
              user_id: donor.user_id,
              type: 'verification',
              title: 'Verification Request Update',
              message: `Your document review was rejected. Reason: ${rejectionReason || 'Please resubmit clearer documents.'}`,
              urgency: 'Urgent',
            });
          }
        }
      }

      this.addAuditLog(reviewerId, 'Admin', 'REVIEW_VERIFICATION', 'verification', docId, {
        decision,
        reason: rejectionReason,
      });

      this.persist();
    }
    return doc;
  }

  // --- Donation History & Certificates ---
  getDonationHistoryByDonor(donorId: string): DonationHistory[] {
    return this.state.donationHistory
      .filter((dh) => dh.donor_id === donorId)
      .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());
  }

  addDonationRecord(record: Partial<DonationHistory>): DonationHistory {
    const newRecord: DonationHistory = {
      id: `dh-${Date.now()}`,
      donor_id: record.donor_id || 'donor-1',
      donation_date: record.donation_date || new Date().toISOString().split('T')[0],
      location: record.location || 'New York, NY',
      hospital_or_blood_bank: record.hospital_or_blood_bank || 'City Blood Center',
      units_donated: record.units_donated || 1,
      donation_type: record.donation_type || 'Whole Blood',
      notes: record.notes,
      certificate_url: `CERT-${new Date().getFullYear()}-BLD-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
    };
    this.state.donationHistory.unshift(newRecord);

    // Update donor counters and availability
    const donor = this.getDonorById(newRecord.donor_id);
    if (donor) {
      donor.total_donations += newRecord.units_donated;
      donor.last_donation_date = newRecord.donation_date;
      donor.availability = 'Recently Donated';
      this.persist();
    }

    this.persist();
    return newRecord;
  }

  // --- Achievements ---
  getAchievements(): Achievement[] {
    return this.state.achievements;
  }

  getAchievementsByDonor(donorId: string): (Achievement & { awarded_at: string })[] {
    const awards = this.state.donorAchievements.filter((da) => da.donor_id === donorId);
    return awards
      .map((aw) => {
        const ach = this.state.achievements.find((a) => a.id === aw.achievement_id);
        if (!ach) return null;
        return {
          ...ach,
          awarded_at: aw.awarded_at,
        };
      })
      .filter(Boolean) as (Achievement & { awarded_at: string })[];
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  private addAuditLog(
    actorId: string,
    actorName: string,
    action: string,
    entityType: AuditLog['entity_type'],
    entityId: string,
    metadata?: Record<string, any>
  ): void {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actor_id: actorId,
      actor_name: actorName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs.pop();
    }
  }

  // --- Reset to initial state ---
  resetToDefaults(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.state = this.loadInitialState();
  }
}

// Export singleton instance
export const db = new DatabaseEngine();
