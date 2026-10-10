'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '@/lib/types';
import { db } from '@/lib/db';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  triggerEmergencyAlert: (title: string, message: string) => void;
  activeToast: Notification | null;
  dismissToast: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  const refreshNotifications = useCallback(() => {
    if (currentUser) {
      const list = db.getNotifications(currentUser.id);
      setNotifications([...list]);
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const playNotificationSound = (isUrgent: boolean = false) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isUrgent) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.15); // A4
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  const markAsRead = (id: string) => {
    db.markNotificationAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    if (currentUser) {
      db.markAllNotificationsAsRead(currentUser.id);
      refreshNotifications();
    }
  };

  const triggerEmergencyAlert = (title: string, message: string) => {
    if (!currentUser) return;
    const notif = db.addNotification({
      user_id: currentUser.id,
      type: 'emergency_sos',
      title,
      message,
      urgency: 'Critical',
    });
    refreshNotifications();
    setActiveToast(notif);
    playNotificationSound(true);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        triggerEmergencyAlert,
        activeToast,
        dismissToast,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      triggerEmergencyAlert: () => {},
      activeToast: null,
      dismissToast: () => {},
      refreshNotifications: () => {},
    };
  }
  return context;
}
