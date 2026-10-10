'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { BloodBank, BloodGroup } from '@/lib/types';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  Edit2,
  Save,
  Clock,
  Phone,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminBloodBanksManager() {
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [inventoryState, setInventoryState] = useState<Record<BloodGroup, number>>({} as any);

  const refreshBanks = () => {
    setBanks(db.getBloodBanks());
  };

  useEffect(() => {
    refreshBanks();
  }, []);

  const handleStartEdit = (bank: BloodBank) => {
    setEditingBankId(bank.id);
    setInventoryState({ ...bank.inventory });
  };

  const handleSaveInventory = (bankId: string) => {
    db.updateBloodBankInventory(bankId, inventoryState);
    setEditingBankId(null);
    refreshBanks();
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-medical-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Blood Bank Inventory Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update real-time component units across affiliated regional blood banks and storage facilities.
          </p>
        </div>
      </div>

      {/* Facilities Cards */}
      <div className="space-y-6">
        {banks.map((bank) => {
          const isEditing = editingBankId === bank.id;

          return (
            <div
              key={bank.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {bank.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {bank.address} • {bank.phone}
                  </p>
                </div>

                <div>
                  {isEditing ? (
                    <button
                      onClick={() => handleSaveInventory(bank.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Inventory Changes</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(bank)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center space-x-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Units</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Units Editor Grid */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Blood Component Units Available:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {ALL_BLOOD_GROUPS.map((bg) => {
                    const currentUnits = isEditing ? inventoryState[bg] || 0 : bank.inventory[bg] || 0;

                    return (
                      <div
                        key={bg}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1.5"
                      >
                        <BloodGroupBadge bloodGroup={bg} size="sm" />
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="500"
                            value={currentUnits}
                            onChange={(e) =>
                              setInventoryState({
                                ...inventoryState,
                                [bg]: Number(e.target.value),
                              })
                            }
                            className="w-full text-center text-xs font-black font-mono px-1 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                          />
                        ) : (
                          <span className="text-base font-black font-mono text-slate-900 dark:text-white block">
                            {currentUnits}u
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
