'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BloodGroup, DonorAvailability, Donor } from '@/lib/types';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { DonorCard } from '@/components/donors/DonorCard';
import { DonorMapPreview } from '@/components/donors/DonorMapPreview';
import { DirectRequestModal } from '@/components/donors/DirectRequestModal';
import { db } from '@/lib/db';
import {
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  Grid,
  Map as MapIcon,
  RefreshCw,
  Users,
  Zap,
  SlidersHorizontal,
  Droplet,
  Info,
} from 'lucide-react';

function FindDonorContent() {
  const searchParams = useSearchParams();

  const initialBloodGroup = (searchParams.get('bloodGroup') as BloodGroup) || 'All';
  const initialCity = searchParams.get('city') || 'All Cities';
  const initialCompatible = searchParams.get('compatible') !== 'false';

  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'All'>(
    initialBloodGroup
  );
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [includeCompatible, setIncludeCompatible] = useState<boolean>(initialCompatible);
  const [availability, setAvailability] = useState<DonorAvailability | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [emergencyReadyOnly, setEmergencyReadyOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // General Direct Request Modal state
  const [isGeneralRequestModalOpen, setIsGeneralRequestModalOpen] = useState(false);

  // Read donors from DB
  const [allDonors, setAllDonors] = useState<Donor[]>([]);

  const refreshDonors = () => {
    setAllDonors(db.getDonors());
  };

  useEffect(() => {
    refreshDonors();
  }, []);

  // Filtered Donors calculation
  const filteredDonors = useMemo(() => {
    return allDonors.filter((donor) => {
      // Blood group filter
      if (selectedBloodGroup !== 'All') {
        if (includeCompatible) {
          const compatibleGroups = getCompatibleDonorGroups(selectedBloodGroup);
          if (!compatibleGroups.includes(donor.blood_group)) return false;
        } else {
          if (donor.blood_group !== selectedBloodGroup) return false;
        }
      }

      // City filter
      if (selectedCity !== 'All Cities') {
        if (!donor.city.toLowerCase().includes(selectedCity.toLowerCase())) return false;
      }

      // Availability filter
      if (availability !== 'all') {
        if (donor.availability !== availability) return false;
      }

      // Verified only
      if (verifiedOnly && donor.verification_status !== 'Verified') {
        return false;
      }

      // Emergency ready
      if (emergencyReadyOnly && !donor.emergency_ready && donor.availability !== 'Emergency-Only') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = donor.name.toLowerCase().includes(q);
        const matchesArea = donor.area.toLowerCase().includes(q);
        const matchesPin = donor.pin_code.includes(q);
        const matchesBio = donor.bio?.toLowerCase().includes(q);
        if (!matchesName && !matchesArea && !matchesPin && !matchesBio) return false;
      }

      return true;
    });
  }, [
    allDonors,
    selectedBloodGroup,
    includeCompatible,
    selectedCity,
    availability,
    verifiedOnly,
    emergencyReadyOnly,
    searchQuery,
  ]);

  const handleResetFilters = () => {
    setSelectedBloodGroup('All');
    setSelectedCity('All Cities');
    setIncludeCompatible(true);
    setAvailability('all');
    setVerifiedOnly(false);
    setEmergencyReadyOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Real-time Donor Discovery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Find Blood Donors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search verified voluntary donors by blood type compatibility, metro proximity, and availability status.
          </p>
        </div>

        {/* View Mode Switcher & Quick Broadcast Button */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Live Map View</span>
            </button>
          </div>

          <button
            onClick={() => setIsGeneralRequestModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
          >
            <Droplet className="w-4 h-4 fill-current" />
            <span>Broadcast Request</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Row 1: Blood Groups Quick Select */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
              <Droplet className="w-3.5 h-3.5 text-medical-red" />
              <span>Blood Group Filter:</span>
            </span>

            {selectedBloodGroup !== 'All' && (
              <label className="flex items-center space-x-1.5 text-xs text-medical-red font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCompatible}
                  onChange={(e) => setIncludeCompatible(e.target.checked)}
                  className="rounded text-medical-red focus:ring-medical-red h-3.5 w-3.5"
                />
                <span>Include Compatible Types ({getCompatibleDonorGroups(selectedBloodGroup).join(', ')})</span>
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBloodGroup('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedBloodGroup === 'All'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>

            {ALL_BLOOD_GROUPS.map((bg) => {
              const isSelected = selectedBloodGroup === bg;
              return (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`transition-all transform ${isSelected ? 'scale-105' : ''}`}
                >
                  <BloodGroupBadge
                    bloodGroup={bg}
                    size="md"
                    className={
                      isSelected
                        ? 'ring-2 ring-medical-red ring-offset-2 dark:ring-offset-slate-900'
                        : 'opacity-85 hover:opacity-100'
                    }
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Search input, Metro City, Availability, Verified Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 items-center">
          
          {/* Keyword search */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search donor name, area, pin code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
            />
          </div>

          {/* City select */}
          <div className="sm:col-span-3">
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="All Cities">All Indian Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="New Delhi">New Delhi / NCR</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Pune">Pune</option>
                <option value="Ahmedabad">Ahmedabad</option>
              </select>
            </div>
          </div>

          {/* Availability select */}
          <div className="sm:col-span-3">
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-medical-red focus:outline-none cursor-pointer"
            >
              <option value="all">Any Availability</option>
              <option value="Available">🟢 Available Now</option>
              <option value="Emergency-Only">🔴 Emergency-Only</option>
              <option value="Recently Donated">🔵 Recently Donated</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="sm:col-span-2 text-right">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Row 3: Quick Checkboxes (Verified, Emergency SOS) */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600 dark:text-slate-300">
          <label className="flex items-center space-x-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-medical-red focus:ring-medical-red h-4 w-4"
            />
            <span className="flex items-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
              Verified Donors Only
            </span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emergencyReadyOnly}
              onChange={(e) => setEmergencyReadyOnly(e.target.checked)}
              className="rounded text-medical-red focus:ring-medical-red h-4 w-4"
            />
            <span className="flex items-center font-medium">
              <Zap className="w-3.5 h-3.5 text-medical-red mr-1 fill-current" />
              Emergency SOS Ready
            </span>
          </label>

          <div className="ml-auto text-slate-500 dark:text-slate-400 font-medium">
            Found <span className="font-bold text-slate-900 dark:text-white">{filteredDonors.length}</span> donors
          </div>
        </div>
      </div>

      {/* Main Content: Grid vs Map */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Interactive map pins show active voluntary donors. Click any pin to inspect verified details and send a direct blood request.
            </span>
          </div>
          <DonorMapPreview donors={filteredDonors} selectedCity={selectedCity} />
        </div>
      ) : (
        <div>
          {filteredDonors.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/60 text-medical-red rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No matching donors found in this area.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Try expanding your search radius, unchecking "Verified Only", or selecting "Include Compatible Blood Types" to discover universal donors.
              </p>
              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setIsGeneralRequestModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
                >
                  Broadcast Emergency Need
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonors.map((donor) => (
                <DonorCard key={donor.id} donor={donor} onFavoriteChange={refreshDonors} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* General Broadcast Request Modal */}
      <DirectRequestModal
        isOpen={isGeneralRequestModalOpen}
        onClose={() => setIsGeneralRequestModalOpen(false)}
        defaultBloodGroup={selectedBloodGroup === 'All' ? 'O+' : selectedBloodGroup}
      />
    </div>
  );
}

export default function FindDonorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading donor directory...</div>}>
      <FindDonorContent />
    </Suspense>
  );
}
