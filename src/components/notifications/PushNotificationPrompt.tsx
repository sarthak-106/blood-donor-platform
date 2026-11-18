'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, ShieldAlert, Sparkles, X } from 'lucide-react';

export const PushNotificationPrompt: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      const isDismissed = localStorage.getItem('push_prompt_dismissed');
      if (isDismissed) setDismissed(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        new Notification('🚨 Emergency SOS Alerts Active', {
          body: 'You are now ready to receive critical blood donor requests even when your browser is in the background.',
          icon: '/favicon.ico',
        });
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3500);
      }
    } catch (err) {
      console.error('Error requesting push permission:', err);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('push_prompt_dismissed', 'true');
    }
  };

  if (dismissed || permission === 'granted' || (typeof window !== 'undefined' && !('Notification' in window))) {
    return null;
  }

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-amber-500/10 border border-red-300 dark:border-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start sm:items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-medical-red text-white flex items-center justify-center shrink-0 shadow-sm">
          <BellRing className="w-4 h-4 animate-bounce" />
        </div>
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">
            Never miss an Emergency Blood SOS in your city
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400">
            Enable background browser push alerts so patients in urgent need can reach you in time.
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
        <button
          onClick={handleRequestPermission}
          className="px-3.5 py-1.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Enable Alerts</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
