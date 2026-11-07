'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  Heart,
  Droplet,
  Search,
  Sparkles,
  Layers,
  Building2,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  AlertTriangle,
  ChevronDown,
  User,
  Shield,
  Clock,
  ArrowRight,
  LogOut,
  PlusCircle,
  Zap,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, currentDonor, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Find active SOS request for top banner
  const emergencyNotif = notifications.find((n) => n.urgency === 'Critical' && !n.read_at);

  return (
    <>
      {/* Top Urgent Emergency Alert Marquee (if critical SOS exists) */}
      {emergencyNotif && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2 truncate mx-auto max-w-7xl">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300"></span>
            </span>
            <span className="uppercase tracking-wider font-extrabold bg-red-900/60 px-2 py-0.5 rounded text-[10px]">
              CRITICAL SOS
            </span>
            <span className="truncate">{emergencyNotif.title} - {emergencyNotif.message}</span>
          </div>
          <Link
            href="/recipient/emergency-sos"
            className="shrink-0 ml-3 text-xs bg-white text-red-700 hover:bg-red-50 px-2.5 py-0.5 rounded font-bold transition flex items-center"
          >
            <span>Respond</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      )}

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
                  <Droplet className="w-6 h-6 fill-current text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                      Blood<span className="text-medical-red">Donor</span>
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-1.5 py-0.5 rounded-full">
                      PRO
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:block">
                    Finder & AI Recognition
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                href="/find-donor"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/find-donor')
                    ? 'text-medical-red bg-red-50 dark:bg-red-950/40 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:text-medical-red hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Search className="w-4 h-4" />
                  <span>Find Donors</span>
                </div>
              </Link>

              <Link
                href="/blood-recognition"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/blood-recognition')
                    ? 'text-medical-red bg-red-50 dark:bg-red-950/40 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:text-medical-red hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Blood Group Guide</span>
                </div>
              </Link>

              <Link
                href="/blood-compatibility"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/blood-compatibility')
                    ? 'text-medical-red bg-red-50 dark:bg-red-950/40 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:text-medical-red hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Compatibility Matrix</span>
                </div>
              </Link>

              <Link
                href="/blood-banks"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/blood-banks')
                    ? 'text-medical-red bg-red-50 dark:bg-red-950/40 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:text-medical-red hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Blood Banks</span>
                </div>
              </Link>

              {/* Portal Dashboard Quick Link if Logged In */}
              {currentUser && (
                <Link
                  href={
                    currentUser.role === 'admin'
                      ? '/admin/dashboard'
                      : currentUser.role === 'donor'
                      ? '/donor/dashboard'
                      : '/recipient/dashboard'
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    pathname.startsWith('/recipient') ||
                    pathname.startsWith('/donor') ||
                    pathname.startsWith('/admin')
                      ? 'text-white bg-medical-red shadow-sm'
                      : 'text-medical-red hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">{currentUser.role} Portal</span>
                  </div>
                </Link>
              )}
            </nav>

            {/* Right Controls & User Persona */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Emergency SOS Quick Button */}
              <Link
                href="/recipient/emergency-sos"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-red-500/25 transition-all hover:scale-105"
              >
                <Zap className="w-4 h-4 fill-current animate-pulse" />
                <span>Emergency SOS</span>
              </Link>

              {/* Dedicated Sign In & Register Buttons for Guests */}
              {!currentUser ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth"
                    className="inline-flex items-center space-x-1.5 bg-white dark:bg-slate-800 text-medical-red hover:bg-red-50 dark:hover:bg-red-950/40 border border-medical-red/30 text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="hidden sm:inline-flex items-center space-x-1.5 bg-medical-red hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              ) : (
                /* Authenticated User Display */
                <div className="flex items-center space-x-2">
                  <Link
                    href={
                      currentUser.role === 'admin'
                        ? '/admin/dashboard'
                        : currentUser.role === 'donor'
                        ? '/donor/dashboard'
                        : '/recipient/dashboard'
                    }
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-medical-red bg-slate-50 dark:bg-slate-800 text-xs transition"
                  >
                    {currentUser.profile_image ? (
                      <img
                        src={currentUser.profile_image}
                        alt={currentUser.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-red-100 text-medical-red font-bold text-[10px] flex items-center justify-center">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="text-left hidden md:block">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="text-[9px] text-slate-500 capitalize">{currentUser.role}</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      fetch('/api/auth/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'logout' }),
                      });
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Notifications Dropdown Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-medical-red text-[10px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-fadeIn">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-xs text-medical-red hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">No notifications yet.</div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition ${
                              !n.read_at ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-2.5">
                              {n.urgency === 'Critical' ? (
                                <AlertTriangle className="w-4 h-4 text-medical-red shrink-0 mt-0.5" />
                              ) : (
                                <Droplet className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                                  {n.title}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {formatTimeAgo(n.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 5 && (
                      <div className="pt-2 px-4 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link
                          href={currentUser?.role === 'donor' ? '/donor/requests' : '/recipient/dashboard'}
                          onClick={() => setIsNotifOpen(false)}
                          className="text-xs text-medical-red font-semibold hover:underline"
                        >
                          View all in Dashboard
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
            <Link
              href="/find-donor"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-4 h-4 text-medical-red" />
              <span>Find Donors</span>
            </Link>

            <Link
              href="/blood-recognition"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Blood Group Guide</span>
            </Link>

            <Link
              href="/blood-compatibility"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Layers className="w-4 h-4 text-medical-red" />
              <span>Compatibility Matrix</span>
            </Link>

            <Link
              href="/blood-banks"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Building2 className="w-4 h-4 text-medical-red" />
              <span>Blood Banks Directory</span>
            </Link>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 border border-medical-red/30 text-medical-red py-2.5 rounded-xl font-bold text-sm shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </Link>
              <Link
                href="/recipient/emergency-sos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 bg-medical-red text-white py-3 rounded-xl font-bold text-sm shadow-md"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Trigger Emergency SOS</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
