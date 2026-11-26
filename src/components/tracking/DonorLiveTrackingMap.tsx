'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  MapPin,
  Hospital,
  Phone,
  ShieldCheck,
  Clock,
  Compass,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Heart,
  Droplet,
  ExternalLink,
  Info,
} from 'lucide-react';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { BloodGroup } from '@/lib/types';

interface DonorLiveTrackingMapProps {
  donorName: string;
  donorBloodGroup?: BloodGroup;
  donorPhone?: string;
  hospitalName: string;
  hospitalCity?: string;
  initialEta?: string;
  requestId: string;
}

// Known regional emergency trauma centers & coordinates
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'New Delhi': { lat: 28.5703, lng: 77.2081 },
  'Delhi NCR': { lat: 28.5703, lng: 77.2081 },
  'Mumbai': { lat: 19.0034, lng: 72.8427 },
  'Bengaluru': { lat: 12.9634, lng: 77.5756 },
  'Hyderabad': { lat: 17.3753, lng: 78.4738 },
  'Chennai': { lat: 13.0805, lng: 80.2789 },
  'Kolkata': { lat: 22.5735, lng: 88.3639 },
  'Pune': { lat: 18.5262, lng: 73.8742 },
  'Ahmedabad': { lat: 23.0300, lng: 72.5800 },
};

export function DonorLiveTrackingMap({
  donorName,
  donorBloodGroup = 'O+',
  donorPhone = '+91 98765 43210',
  hospitalName,
  hospitalCity = 'New Delhi',
  initialEta = '20-30 mins',
  requestId,
}: DonorLiveTrackingMapProps) {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';
  const hasValidGoogleKey = Boolean(googleApiKey && googleApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE');

  const [mapEngine, setMapEngine] = useState<'google' | 'tactical'>(hasValidGoogleKey ? 'google' : 'tactical');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  // Transit Route Generation
  const hospitalCenter = CITY_COORDINATES[hospitalCity] || CITY_COORDINATES['New Delhi'];

  // Generate a realistic 5-step transit waypoint route starting ~4.5 km away
  const routeWaypoints = useRef<Array<{ lat: number; lng: number }>>([
    { lat: hospitalCenter.lat + 0.038, lng: hospitalCenter.lng + 0.025 },
    { lat: hospitalCenter.lat + 0.027, lng: hospitalCenter.lng + 0.018 },
    { lat: hospitalCenter.lat + 0.018, lng: hospitalCenter.lng + 0.011 },
    { lat: hospitalCenter.lat + 0.009, lng: hospitalCenter.lng + 0.004 },
    { lat: hospitalCenter.lat, lng: hospitalCenter.lng },
  ]).current;

  // Simulation & Progress State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(4.2);
  const [liveEtaMins, setLiveEtaMins] = useState(18);
  const [speedKmh, setSpeedKmh] = useState(34);
  const [transitStatus, setTransitStatus] = useState<'En Route' | 'Arriving Soon' | 'Arrived at Blood Bank'>('En Route');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const donorMarkerRef = useRef<any>(null);
  const hospitalMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // 1. Google Maps Script Loader
  useEffect(() => {
    if (!hasValidGoogleKey) {
      setMapEngine('tactical');
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      script.onerror = () => {
        setGoogleMapsError(true);
        setMapEngine('tactical');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setGoogleMapsLoaded(true));
      script.addEventListener('error', () => {
        setGoogleMapsError(true);
        setMapEngine('tactical');
      });
    }
  }, [hasValidGoogleKey, googleApiKey]);

  // 2. Google Maps Canvas Initialization
  useEffect(() => {
    if (!googleMapsLoaded || mapEngine !== 'google' || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    if (!googleMapInstanceRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: hospitalCenter,
        zoom: 13,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi.medical', elementType: 'all', stylers: [{ visibility: 'on' }, { color: '#fee2e2' }] },
          { featureType: 'transit.station', elementType: 'all', stylers: [{ visibility: 'on' }] },
        ],
      });
      googleMapInstanceRef.current = map;

      // Hospital Destination Marker
      hospitalMarkerRef.current = new google.maps.Marker({
        position: hospitalCenter,
        map,
        title: hospitalName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        label: {
          text: '🏥',
          fontSize: '14px',
        },
      });

      // Hospital Info Window
      const hospitalInfo = new google.maps.InfoWindow({
        content: `<div style="padding: 6px; font-family: sans-serif;">
          <strong style="color: #065F46; font-size: 13px;">${hospitalName}</strong><br/>
          <span style="color: #6B7280; font-size: 11px;">Destination Blood Donation Center</span>
        </div>`,
      });
      hospitalMarkerRef.current.addListener('click', () => {
        hospitalInfo.open(map, hospitalMarkerRef.current);
      });

      // Route Polyline
      polylineRef.current = new google.maps.Polyline({
        path: routeWaypoints,
        geodesic: true,
        strokeColor: '#DC2626',
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map,
      });

      // Fit bounds around whole trip
      const bounds = new google.maps.LatLngBounds();
      routeWaypoints.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds);
    }

    // Donor Live Position Marker
    const currentDonorPos = routeWaypoints[currentStepIndex] || routeWaypoints[0];

    if (!donorMarkerRef.current) {
      donorMarkerRef.current = new google.maps.Marker({
        position: currentDonorPos,
        map: googleMapInstanceRef.current,
        title: `Donor: ${donorName}`,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#E53935',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          rotation: 215, // Oriented toward destination
        },
      });
    } else {
      donorMarkerRef.current.setPosition(currentDonorPos);
    }
  }, [googleMapsLoaded, mapEngine, hospitalCenter, hospitalName, donorName, currentStepIndex, routeWaypoints]);

  // 3. Movement Animation / GPS Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= routeWaypoints.length - 1) {
          setTransitStatus('Arrived at Blood Bank');
          setDistanceRemainingKm(0);
          setLiveEtaMins(0);
          setSpeedKmh(0);
          return prev;
        }

        const next = prev + 1;
        const total = routeWaypoints.length - 1;
        const remainingFraction = (total - next) / total;

        const newDist = Math.max(0, +(4.2 * remainingFraction).toFixed(1));
        const newEta = Math.max(1, Math.round(18 * remainingFraction));
        setDistanceRemainingKm(newDist);
        setLiveEtaMins(newEta);
        setSpeedKmh(Math.floor(28 + Math.random() * 12));

        if (next === total) {
          setTransitStatus('Arrived at Blood Bank');
        } else if (next === total - 1) {
          setTransitStatus('Arriving Soon');
        } else {
          setTransitStatus('En Route');
        }

        // Pan map if Google Map is active
        if (googleMapInstanceRef.current && routeWaypoints[next]) {
          googleMapInstanceRef.current.panTo(routeWaypoints[next]);
        }

        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, routeWaypoints]);

  const handleResetSimulation = () => {
    setCurrentStepIndex(0);
    setDistanceRemainingKm(4.2);
    setLiveEtaMins(18);
    setSpeedKmh(34);
    setTransitStatus('En Route');
    setIsSimulating(true);
    if (googleMapInstanceRef.current && routeWaypoints[0]) {
      googleMapInstanceRef.current.panTo(routeWaypoints[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden space-y-0">
      
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg">
              🩸
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-sm sm:text-base tracking-tight">Live Donor Transit Tracking</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                Active En-Route
              </span>
            </div>
            <p className="text-xs text-red-100 flex items-center gap-1.5 mt-0.5">
              <span>{donorName} is traveling to <strong>{hospitalName}</strong></span>
            </p>
          </div>
        </div>

        {/* Live Metrics Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-red-200 block uppercase font-semibold">Live ETA</span>
            <span className="text-sm font-black font-mono">
              {transitStatus === 'Arrived at Blood Bank' ? 'ARRIVED ✅' : `~${liveEtaMins} mins`}
            </span>
          </div>
          <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-red-200 block uppercase font-semibold">Remaining</span>
            <span className="text-sm font-black font-mono">{distanceRemainingKm} km</span>
          </div>
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative h-[360px] sm:h-[420px] w-full bg-slate-950 overflow-hidden">
        
        {mapEngine === 'google' ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          /* High-Contrast Tactical Satellite Radar Canvas (When Google Maps key is omitted or tactical is toggled) */
          <div className="w-full h-full relative bg-[#0b1320] flex items-center justify-center overflow-hidden">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, #0b1320 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* Radar Circle Overlays */}
            <div className="absolute w-[450px] h-[450px] rounded-full border border-cyan-500/15 animate-pulse" />
            <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/25" />
            <div className="absolute w-[150px] h-[150px] rounded-full border border-cyan-500/40" />

            {/* SVG Projected Polyline */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <line
                x1="22%"
                y1="25%"
                x2="78%"
                y2="75%"
                stroke="url(#routeGrad)"
                strokeWidth="4"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Donor Position Marker on Tactical Canvas */}
            <div
              className="absolute transition-all duration-1000 ease-in-out z-20 flex flex-col items-center"
              style={{
                left: `${22 + (currentStepIndex / (routeWaypoints.length - 1)) * 56}%`,
                top: `${25 + (currentStepIndex / (routeWaypoints.length - 1)) * 50}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping" />
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/50 border-2 border-white">
                  🚗
                </div>
              </div>
              <div className="mt-1 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-red-500/40 text-center whitespace-nowrap">
                <span className="text-[11px] font-black text-white">{donorName}</span>
                <span className="text-[9px] text-red-400 block font-mono">{speedKmh} km/h</span>
              </div>
            </div>

            {/* Hospital Destination Marker on Tactical Canvas */}
            <div className="absolute z-10 flex flex-col items-center" style={{ left: '78%', top: '75%', transform: 'translate(-50%, -50%)' }}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/50 border-2 border-white animate-bounce">
                🏥
              </div>
              <div className="mt-1 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-emerald-500/40 text-center whitespace-nowrap">
                <span className="text-[11px] font-black text-emerald-300">{hospitalName}</span>
                <span className="text-[9px] text-slate-400 block font-mono">Blood Bank Unit</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Real-Time Status HUD Card */}
        <div className="absolute top-3 left-3 z-30 max-w-[280px] bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 shadow-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              Live Telemetry
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                transitStatus === 'Arrived at Blood Bank'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {transitStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">Current Speed</span>
              <span className="font-mono font-bold text-slate-200">{speedKmh} km/h</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Route Progress</span>
              <span className="font-mono font-bold text-slate-200">
                {Math.round((currentStepIndex / (routeWaypoints.length - 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-500 to-emerald-500 h-full transition-all duration-700"
              style={{ width: `${(currentStepIndex / (routeWaypoints.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Engine Toggle & Simulator Controls */}
        <div className="absolute bottom-3 right-3 z-30 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl">
          {hasValidGoogleKey && (
            <button
              onClick={() => setMapEngine((prev) => (prev === 'google' ? 'tactical' : 'google'))}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              {mapEngine === 'google' ? 'Tactical Radar' : 'Google Maps'}
            </button>
          )}

          <button
            onClick={() => setIsSimulating((prev) => !prev)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
            title={isSimulating ? 'Pause Transit Simulation' : 'Resume Transit Simulation'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={handleResetSimulation}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
            title="Reset Route Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Donor Action Footer Bar */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/80 text-medical-red flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            {donorName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base truncate">
                {donorName}
              </span>
              <BloodGroupBadge bloodGroup={donorBloodGroup} size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified Emergency Volunteer • Contact: <span className="font-mono font-semibold">{donorPhone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <a
            href={`tel:${donorPhone.replace(/\s+/g, '')}`}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Donor</span>
          </a>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospitalName + ', ' + hospitalCity)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5"
            title="Open in Google Maps Directions"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directions</span>
          </a>
        </div>
      </div>

      {/* Legal & Privacy Disclosure Banner */}
      <div className="px-4 py-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border-t border-emerald-200/60 dark:border-emerald-800/50 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>Live Transit Disclosure:</strong> Coordinates are broadcast in real-time under{' '}
          <a href="/privacy#donor-tracking" target="_blank" className="underline font-bold hover:text-emerald-900">
            Privacy Policy Section 4
          </a>{' '}
          solely while donor is traveling to the donation hub. Tracking automatically halts upon arrival.
        </span>
      </div>
    </div>
  );
}
