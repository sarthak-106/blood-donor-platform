import { BloodGroup } from './types';

export const ALL_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// RBC (Red Blood Cell) compatibility rules
export const RBC_COMPATIBILITY: Record<BloodGroup, { canDonateTo: BloodGroup[]; canReceiveFrom: BloodGroup[] }> = {
  'O-': {
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal RBC donor
    canReceiveFrom: ['O-'],
  },
  'O+': {
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
  },
  'A-': {
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
  },
  'A+': {
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
  },
  'B-': {
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
  },
  'B+': {
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
  },
  'AB-': {
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
  },
  'AB+': {
    canDonateTo: ['AB+'],
    canReceiveFrom: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal RBC recipient
  },
};

// Plasma compatibility rules (inverse of RBC)
export const PLASMA_COMPATIBILITY: Record<BloodGroup, { canDonateTo: BloodGroup[]; canReceiveFrom: BloodGroup[] }> = {
  'AB+': {
    canDonateTo: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal Plasma donor
    canReceiveFrom: ['AB+'],
  },
  'AB-': {
    canDonateTo: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    canReceiveFrom: ['AB+', 'AB-'],
  },
  'A+': {
    canDonateTo: ['A+', 'A-', 'O+', 'O-'],
    canReceiveFrom: ['A+', 'AB+'],
  },
  'A-': {
    canDonateTo: ['A+', 'A-', 'O+', 'O-'],
    canReceiveFrom: ['A+', 'A-', 'AB+', 'AB-'],
  },
  'B+': {
    canDonateTo: ['B+', 'B-', 'O+', 'O-'],
    canReceiveFrom: ['B+', 'AB+'],
  },
  'B-': {
    canDonateTo: ['B+', 'B-', 'O+', 'O-'],
    canReceiveFrom: ['B+', 'B-', 'AB+', 'AB-'],
  },
  'O+': {
    canDonateTo: ['O+', 'O-'],
    canReceiveFrom: ['O+', 'A+', 'B+', 'AB+'],
  },
  'O-': {
    canDonateTo: ['O+', 'O-'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Plasma recipient
  },
};

// Check if donor blood type is compatible for recipient
export function isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup, component: 'RBC' | 'Plasma' = 'RBC'): boolean {
  if (component === 'RBC') {
    return RBC_COMPATIBILITY[recipientGroup]?.canReceiveFrom.includes(donorGroup) ?? false;
  }
  return PLASMA_COMPATIBILITY[recipientGroup]?.canReceiveFrom.includes(donorGroup) ?? false;
}

// Get all compatible donor blood groups for a given recipient
export function getCompatibleDonorGroups(recipientGroup: BloodGroup): BloodGroup[] {
  return RBC_COMPATIBILITY[recipientGroup]?.canReceiveFrom ?? [recipientGroup];
}

// Determine blood group from antigens
export interface AntigenTestResult {
  hasAntigenA: boolean;
  hasAntigenB: boolean;
  hasRhFactor: boolean; // D antigen
}

export function deduceBloodTypeFromAntigens(result: AntigenTestResult): {
  bloodGroup: BloodGroup;
  explanation: string;
  antigensPresent: string[];
  antibodiesPresent: string[];
  universalRole: string;
} {
  const { hasAntigenA, hasAntigenB, hasRhFactor } = result;
  
  let abo = 'O';
  if (hasAntigenA && hasAntigenB) abo = 'AB';
  else if (hasAntigenA) abo = 'A';
  else if (hasAntigenB) abo = 'B';
  
  const rh = hasRhFactor ? '+' : '-';
  const bloodGroup = `${abo}${rh}` as BloodGroup;

  const antigens: string[] = [];
  if (hasAntigenA) antigens.push('A Antigen');
  if (hasAntigenB) antigens.push('B Antigen');
  if (hasRhFactor) antigens.push('Rh (D) Antigen');
  if (antigens.length === 0) antigens.push('None (O Type)');

  const antibodies: string[] = [];
  if (!hasAntigenA && !hasAntigenB) antibodies.push('Anti-A and Anti-B Antibodies');
  else if (!hasAntigenA) antibodies.push('Anti-A Antibodies');
  else if (!hasAntigenB) antibodies.push('Anti-B Antibodies');
  if (!hasRhFactor) antibodies.push('Potential Anti-Rh (if sensitized)');
  if (antibodies.length === 0) antibodies.push('None');

  let universalRole = 'Standard Donor/Recipient';
  if (bloodGroup === 'O-') universalRole = 'Universal Red Blood Cell Donor';
  else if (bloodGroup === 'AB+') universalRole = 'Universal Red Blood Cell Recipient / Universal Plasma Donor';
  else if (bloodGroup === 'O+') universalRole = 'High Demand Universal Positive Donor';

  return {
    bloodGroup,
    explanation: `Based on detected red blood cell surface markers (${antigens.join(', ')}), the sample corresponds to Blood Group ${bloodGroup}.`,
    antigensPresent: antigens,
    antibodiesPresent: antibodies,
    universalRole,
  };
}

// Haversine formula to compute distance in km between 2 coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const MEDICAL_SAFETY_DISCLAIMER = `DISCLAIMER: The information, compatibility matrices, and AI recognition tools provided by this platform are for educational and coordination purposes only. Actual blood transfusion compatibility and medical suitability must be verified and authorized by licensed healthcare professionals and certified laboratory cross-matching before any transfusion takes place.`;
