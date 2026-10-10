'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Donor, UserRole } from '@/lib/types';
import { db } from '@/lib/db';
import { SEED_USERS } from '@/lib/seedData';

export interface DemoPersona {
  id: string;
  name: string;
  role: UserRole;
  description: string;
  avatar: string;
  badge?: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'user-recipient-1',
    name: 'Priya Sharma',
    role: 'recipient',
    description: 'Patient Recipient • Active B+ request at AIIMS New Delhi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    badge: 'Recipient',
  },
  {
    id: 'user-donor-1',
    name: 'Rajesh Patel',
    role: 'donor',
    description: 'Verified O- Universal Donor • 14 Donations in Mumbai',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    badge: 'Donor (O-)',
  },
  {
    id: 'user-hospital-1',
    name: 'Dr. Ananya Sen',
    role: 'hospital',
    description: 'Hospital Coordinator • AIIMS New Delhi Trauma Centre',
    avatar: 'https://images.unsplash.com/photo-1594824813572-c28fa4c6eb27?w=150',
    badge: 'AIIMS Staff',
  },
  {
    id: 'user-admin-1',
    name: 'Vikram Malhotra',
    role: 'admin',
    description: 'System Administrator • National Blood Registry Directorate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    badge: 'Admin',
  },
];

interface AuthContextType {
  currentUser: User | null;
  currentDonor: Donor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsPersona: (personaId: string) => void;
  loginAsGuest: () => void;
  login: (email: string, role?: UserRole) => boolean;
  register: (userData: Partial<User>, donorData?: Partial<Donor>) => User;
  logout: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'blood_donor_auth_user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentDonor, setCurrentDonor] = useState<Donor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = (userId: string | null) => {
    if (!userId) {
      // Default to David Chen (Donor) for immediate rich experience or Sarah Jenkins
      const defaultUser = SEED_USERS[0]; // Sarah Jenkins
      setCurrentUser(defaultUser);
      const donor = db.getDonorByUserId(defaultUser.id);
      setCurrentDonor(donor || null);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, defaultUser.id);
      }
      setIsLoading(false);
      return;
    }

    const user = db.getUserById(userId);
    if (user) {
      setCurrentUser(user);
      const donor = db.getDonorByUserId(user.id);
      setCurrentDonor(donor || null);
    } else {
      setCurrentUser(null);
      setCurrentDonor(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
      loadUser(savedUserId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUserData = () => {
    if (currentUser) {
      const updatedUser = db.getUserById(currentUser.id);
      if (updatedUser) {
        setCurrentUser({ ...updatedUser });
      }
      const donor = db.getDonorByUserId(currentUser.id);
      setCurrentDonor(donor ? { ...donor } : null);
    }
  };

  const loginAsPersona = (personaId: string) => {
    const user = db.getUserById(personaId);
    if (user) {
      setCurrentUser(user);
      const donor = db.getDonorByUserId(user.id);
      setCurrentDonor(donor || null);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, user.id);
      }
    }
  };

  const loginAsGuest = () => {
    setCurrentUser(null);
    setCurrentDonor(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const login = (email: string, role?: UserRole): boolean => {
    let user = db.getUserByEmail(email);
    if (!user) {
      // Create user on the fly for demo convenience
      user = db.createUser({
        name: email.split('@')[0],
        email,
        role: role || 'recipient',
      });
    }
    setCurrentUser(user);
    const donor = db.getDonorByUserId(user.id);
    setCurrentDonor(donor || null);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    }
    return true;
  };

  const register = (userData: Partial<User>, donorData?: Partial<Donor>): User => {
    const newUser = db.createUser(userData);
    if (userData.role === 'donor') {
      const newDonor = db.createDonor({
        ...donorData,
        user_id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      });
      setCurrentDonor(newDonor);
    }
    setCurrentUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, newUser.id);
    }
    return newUser;
  };

  const logout = () => {
    loginAsGuest();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentDonor,
        isAuthenticated: !!currentUser,
        isLoading,
        loginAsPersona,
        loginAsGuest,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      currentUser: SEED_USERS[0],
      currentDonor: null,
      isAuthenticated: true,
      isLoading: false,
      loginAsPersona: () => {},
      loginAsGuest: () => {},
      login: () => true,
      register: () => SEED_USERS[0],
      logout: () => {},
      refreshUserData: () => {},
    };
  }
  return context;
}
