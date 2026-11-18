'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BloodBank, BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Search,
  Navigation,
  ShieldCheck,
  Droplet,
  ExternalLink,
  Edit3,
  X,
  CheckCircle2,
  AlertTriangle,
  Heart,
  PlusCircle,
} from 'lucide-react';

export default function BloodBanksPage() {
  const { currentUser } = useAuth();
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'All'>('All');
  const [is24x7Only, setIs24x7Only] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Stock edit modal
  const [editingBank, setEditingBank] = useState<BloodBank | null>(null);
  const [editGroup, setEditGroup] = useState<BloodGroup>('B+');
  const [editUnits, setEditUnits] = useState<number>(10);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Live Blood Bank Stock & 24x7 Storage Units | BloodDonor Platform';
  }, []);

  const allBanks = db.getBloodBanks();

  const filteredBanks = allBanks
    .filter((bank) => {
      if (selectedCity !== 'All Cities' && !bank.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }
      if (is24x7Only && !bank.is_24x7) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = bank.name.toLowerCase().includes(q);
        const matchAddress = bank.address.toLowerCase().includes(q);
        const matchServices = bank.services.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchAddress && !matchServices) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (selectedGroup !== 'All') {
        const unitsA = a.inventory?.[selectedGroup] || 0;
        const unitsB = b.inventory?.[selectedGroup] || 0;
        return unitsB - unitsA; // Show highest available stock first
      }
      return 0;
    });

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBank) return;

    db.updateBloodBankInventory(editingBank.id, editGroup, Number(editUnits));
    setEditSuccess(`Stock for ${editGroup} updated to ${editUnits} units.`);
    setTimeout(() => {
      setEditSuccess(null);
      setEditingBank(null);
    }, 1200);
  };

  const getStockStatus = (units: number) => {
    if (units === 0) {
      return {
        label: 'Out of Stock',
        badge: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-200',
        dot: 'bg-red-500',
      };
    }
    if (units < 10) {
      return {
        label: 'Low Stock',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: 'Available in Stock',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200',
      dot: 'bg-emerald-500',
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-medical-red text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Facility & Live Inventory Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Verified Blood Banks & Live Stock Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time blood unit availability across certified regional blood banks and apheresis centers in India.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/camps"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
          >
            <Heart className="w-4 h-4 text-medical-red fill-current" />
            <span>Donation Camps</span>
          </Link>
          <a
            href="tel:104"
            className="px-4 py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
          >
            <Phone className="w-4 h-4" />
            <span>Helpline: 104</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility name, address, or service..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
            />
          </div>

          {/* City Filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-medical-red focus:outline-none cursor-pointer"
            >
              <option value="All Cities">All Indian Metropolitan Centers</option>
              <option value="New Delhi">New Delhi (NCR)</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </div>

          {/* 24/7 Filter */}
          <div className="sm:col-span-3 flex items-center justify-end">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={is24x7Only}
                onChange={(e) => setIs24x7Only(e.target.checked)}
                className="rounded text-medical-red focus:ring-medical-red h-4 w-4"
              />
              <span>24/7 Open Only</span>
            </label>
          </div>
        </div>

        {/* Blood Group Live Stock Filter Chips */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Filter by Target Stock Group:
          </span>
          <button
            onClick={() => setSelectedGroup('All')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              selectedGroup === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Groups
          </button>
          {ALL_BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                selectedGroup === bg
                  ? 'bg-medical-red text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-medical-red'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Blood Banks Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBanks.map((bank) => {
          const targetStock = selectedGroup !== 'All' ? bank.inventory?.[selectedGroup] || 0 : null;
          const status = targetStock !== null ? getStockStatus(targetStock) : null;

          return (
            <div
              key={bank.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-lg text-slate-900 dark:text-white">
                        {bank.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                      {bank.address}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {bank.is_24x7 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold tracking-wider">
                        24/7 OPEN
                      </span>
                    )}
                    {status && (
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        <span>
                          {selectedGroup}: {targetStock}u ({status.label})
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Timing & Phone */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{bank.opening_hours}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-medical-red shrink-0" />
                    <a href={`tel:${bank.phone}`} className="font-semibold hover:underline truncate">
                      {bank.phone}
                    </a>
                  </div>
                </div>

                {/* Live Blood Inventory Units */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Live Stock Inventory (Units):
                    </span>
                    <button
                      onClick={() => {
                        setEditingBank(bank);
                        setEditGroup(selectedGroup !== 'All' ? selectedGroup : 'B+');
                        setEditUnits(bank.inventory[selectedGroup !== 'All' ? selectedGroup : 'B+'] || 0);
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-medical-red flex items-center space-x-1 transition"
                      title="Update blood bank inventory"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Update Stock</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {ALL_BLOOD_GROUPS.map((bg) => {
                      const units = bank.inventory[bg] || 0;
                      const isHighlighted = selectedGroup === bg;
                      return (
                        <div
                          key={bg}
                          className={`p-1.5 rounded-xl text-center border transition ${
                            isHighlighted
                              ? 'border-medical-red bg-red-50 dark:bg-red-950/60 ring-2 ring-red-500/20'
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-slate-400 block">{bg}</span>
                          <span
                            className={`text-xs font-black font-mono ${
                              units === 0
                                ? 'text-slate-400'
                                : units < 5
                                ? 'text-medical-red'
                                : units < 15
                                ? 'text-amber-500'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {units}u
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
                <a
                  href={`tel:${bank.phone}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center justify-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(bank.name + ' ' + bank.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center space-x-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Update Stock */}
      {editingBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Update Stock Inventory
                </h3>
                <p className="text-[11px] text-slate-500 truncate">{editingBank.name}</p>
              </div>
              <button
                onClick={() => setEditingBank(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-emerald-600">{editSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateStock} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Blood Group
                  </label>
                  <select
                    value={editGroup}
                    onChange={(e) => {
                      const bg = e.target.value as BloodGroup;
                      setEditGroup(bg);
                      setEditUnits(editingBank.inventory[bg] || 0);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Available Units (Bags)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={editUnits}
                    onChange={(e) => setEditUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow transition"
                  >
                    Save Inventory Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
