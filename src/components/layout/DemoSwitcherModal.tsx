'use client';

import React from 'react';
import { useAuth, DEMO_PERSONAS } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { UserCheck, RefreshCw, X, ShieldAlert, Sparkles, User } from 'lucide-react';

interface DemoSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoSwitcherModal: React.FC<DemoSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginAsPersona, loginAsGuest, refreshUserData } = useAuth();

  if (!isOpen) return null;

  const handleSelectPersona = (personaId: string) => {
    loginAsPersona(personaId);
    onClose();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (donors, requests, verification queue) to defaults?')) {
      db.resetToDefaults();
      refreshUserData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/80 flex items-center justify-center text-medical-red">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Role & Persona Switcher</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly switch roles to test full multi-user workflows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Options */}
        <div className="space-y-2.5 mt-5">
          {DEMO_PERSONAS.map((persona) => {
            const isSelected = currentUser?.id === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => handleSelectPersona(persona.id)}
                className={`w-full flex items-center p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-medical-red bg-red-50/70 dark:bg-red-950/30 ring-2 ring-medical-red/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                />
                <div className="ml-3.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {persona.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        persona.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : persona.role === 'hospital'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : persona.role === 'donor'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {persona.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {persona.description}
                  </p>
                </div>
                {isSelected && <UserCheck className="w-5 h-5 text-medical-red ml-2 shrink-0" />}
              </button>
            );
          })}

          {/* Guest Mode */}
          <button
            onClick={() => {
              loginAsGuest();
              onClose();
            }}
            className={`w-full flex items-center p-3 rounded-xl border text-left transition-all ${
              !currentUser
                ? 'border-slate-400 bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-300'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <User className="w-5 h-5" />
            </div>
            <div className="ml-3 flex-1">
              <span className="font-semibold text-slate-900 dark:text-white text-sm">Guest Mode (Unauthenticated)</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Browse public search, compatibility & blood banks</p>
            </div>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleResetData}
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
