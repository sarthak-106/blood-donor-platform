'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Donor, BloodGroup } from '@/lib/types';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { DirectRequestModal } from './DirectRequestModal';
import { MapPin, Navigation, Phone, ShieldCheck, Heart, Droplet, User, Eye, Layers, Globe } from 'lucide-react';
import Link from 'next/link';
import { formatPublicDonorName, formatApproximateArea } from '@/lib/utils';

interface DonorMapPreviewProps {
  donors: Donor[];
  selectedCity: string;
}

export const DonorMapPreview: React.FC<DonorMapPreviewProps> = ({ donors, selectedCity }) => {
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(donors[0] || null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [radiusKm, setRadiusKm] = useState(15);
  const [mapType, setMapType] = useState<'google' | 'tactical'>('google');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';
  const hasValidGoogleKey = Boolean(googleApiKey && googleApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE');

  // Normalize map coordinates around Indian metropolitan centers
  const cityCoordinates: Record<string, { lat: number; lng: number; name: string }> = {
    'New Delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi NCR (AIIMS / Safdarjung)' },
    'Delhi NCR': { lat: 28.6139, lng: 77.2090, name: 'Delhi NCR (Gurugram / Noida)' },
    'Mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai (Parel / Bandra / KEM)' },
    'Bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru (Koramangala / Indiranagar)' },
    'Hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad (Banjara Hills / KIMS)' },
    'Chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai (Greams Road / Adyar)' },
    'Kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata (Salt Lake / Park Street)' },
    'Pune': { lat: 18.5204, lng: 73.8567, name: 'Pune (Kothrud / Ruby Hall)' },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad (Navrangpura / Prathama)' },
  };

  const currentCenter = cityCoordinates[selectedCity] || cityCoordinates['New Delhi'];

  // Load Google Maps script when API key is present
  useEffect(() => {
    if (!hasValidGoogleKey) {
      setMapType('tactical');
      return;
    }

    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-api-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      script.onerror = () => {
        setGoogleMapsError(true);
        setMapType('tactical');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setGoogleMapsLoaded(true));
      script.addEventListener('error', () => {
        setGoogleMapsError(true);
        setMapType('tactical');
      });
    }
  }, [hasValidGoogleKey, googleApiKey]);

  // Initialize or update Google Map instance
  useEffect(() => {
    if (!googleMapsLoaded || mapType !== 'google' || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    // Create Map if not already instantiated
    if (!googleMapInstanceRef.current) {
      googleMapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: currentCenter.lat, lng: currentCenter.lng },
        zoom: 12,
        mapTypeId: 'roadmap',
        styles: [
          { featureType: 'poi.medical', stylers: [{ visibility: 'on' }, { color: '#ef4444' }] },
        ],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
    } else {
      googleMapInstanceRef.current.panTo({ lat: currentCenter.lat, lng: currentCenter.lng });
    }

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Place markers for each donor
    donors.forEach((donor) => {
      const lat = donor.latitude || currentCenter.lat + (Math.random() - 0.5) * 0.08;
      const lng = donor.longitude || currentCenter.lng + (Math.random() - 0.5) * 0.08;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: googleMapInstanceRef.current,
        title: `${donor.name} (${donor.blood_group})`,
        label: {
          text: donor.blood_group,
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '11px',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#dc2626',
          fillOpacity: 0.95,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });

      marker.addListener('click', () => {
        setSelectedDonor(donor);
      });

      markersRef.current.push(marker);
    });
  }, [googleMapsLoaded, mapType, donors, currentCenter]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner">
      {/* Map Control Header */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Navigation className="w-3.5 h-3.5 text-medical-red" />
          <span>{currentCenter.name}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
          <span>Radius:</span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-0.5 text-xs font-semibold focus:outline-none"
          >
            <option value={5}>5 km</option>
            <option value={15}>15 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span className="text-slate-500 dark:text-slate-400">
          {donors.length} active donors nearby
        </span>
      </div>

      {/* Map Mode Switcher & API Status in top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-xs">
        {hasValidGoogleKey && !googleMapsError && (
          <button
            onClick={() => setMapType('google')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition ${
              mapType === 'google'
                ? 'bg-medical-red text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Google Maps</span>
          </button>
        )}
        <button
          onClick={() => setMapType('tactical')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition ${
            mapType === 'tactical'
              ? 'bg-medical-red text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>Tactical Radar</span>
        </button>
      </div>

      {/* Google Maps Viewport */}
      {hasValidGoogleKey && !googleMapsError && mapType === 'google' ? (
        <div ref={mapContainerRef} className="w-full h-[480px] bg-slate-200 dark:bg-slate-800" />
      ) : (
        /* High-Fidelity Tactical Map Surface */
        <div className="relative w-full h-[480px] bg-slate-900 overflow-hidden select-none">
          {/* Grid and Road Network Graphics */}
          <div className="absolute inset-0 opacity-25">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#64748b" strokeWidth="0.8" />
                  <circle cx="30" cy="30" r="1.5" fill="#475569" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              {/* Major Arterial Roads */}
              <path
                d="M 0 140 Q 300 220 800 180 T 1600 300"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="opacity-40"
              />
              <path
                d="M 200 0 C 250 200 380 400 420 600"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2.5"
                className="opacity-20"
              />
              <path
                d="M 600 0 Q 550 280 750 600"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2.5"
                className="opacity-20"
              />
            </svg>
          </div>

          {/* Pulse radius radar circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-96 h-96 rounded-full border border-red-500/20 bg-red-500/5 animate-pulse flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-red-500/30" />
            </div>
          </div>

          {/* Dynamic Donor Map Pins */}
          {donors.map((donor, idx) => {
            const seedX = ((idx * 73) % 76) + 12; // 12% to 88%
            const seedY = ((idx * 51) % 68) + 16; // 16% to 84%
            const isSelected = selectedDonor?.id === donor.id;

            return (
              <button
                key={donor.id}
                onClick={() => setSelectedDonor(donor)}
                style={{ left: `${seedX}%`, top: `${seedY}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 transform group ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-115 hover:z-20'
                }`}
                title={`${donor.name} (${donor.blood_group})`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`px-2 py-1 rounded-xl shadow-lg border-2 flex items-center space-x-1 transition ${
                      isSelected
                        ? 'bg-white text-slate-900 border-medical-red shadow-red-500/40 ring-4 ring-medical-red/30'
                        : 'bg-slate-900/90 text-white border-slate-700 hover:border-medical-red'
                    }`}
                  >
                    <BloodGroupBadge bloodGroup={donor.blood_group} size="sm" />
                    <span className="text-[10px] font-bold tracking-tight">
                      {donor.name.split(' ')[0]}
                    </span>
                  </div>
                  {/* Pin pointer tip */}
                  <div
                    className={`w-2 h-2 rotate-45 -mt-1 ${
                      isSelected ? 'bg-medical-red' : 'bg-slate-800'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Donor Floating Info Drawer (bottom right) */}
      {selectedDonor && (
        <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-medical-red font-bold">
                {selectedDonor.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {formatPublicDonorName(selectedDonor.name)}
                  </h4>
                  {selectedDonor.verification_status === 'Verified' && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {formatApproximateArea(selectedDonor.area, selectedDonor.city)}
                </span>
              </div>
            </div>
            <BloodGroupBadge bloodGroup={selectedDonor.blood_group} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-3 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px]">Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedDonor.availability}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Response Time</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                ~{selectedDonor.avg_response_time}
              </span>
            </div>
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>Request Blood</span>
            </button>
            <Link
              href={`/donors/${selectedDonor.id}`}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition"
            >
              Profile
            </Link>
          </div>
        </div>
      )}

      {selectedDonor && (
        <DirectRequestModal
          donor={selectedDonor}
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
        />
      )}
    </div>
  );
};
