'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Donor, UserRole } from '@/lib/types';
import { db } from '@/lib/db';

export interface DemoPersona {
  id: string;
  name: string;
  role: UserRole;
  description: string;
  avatar: string;
  badge?: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [];

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

  // Load session from server or storage
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Try server session first
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (data.success && data.user) {
          const userObj: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            role: data.user.role as UserRole,
            profile_image: data.user.profile_image,
            verification_status: data.user.verification_status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCurrentUser(userObj);
          const donor = db.getDonorByUserId(userObj.id);
          setCurrentDonor(donor || null);
          setIsLoading(false);
          return;
        }

        // 2. Fallback to localStorage for client-created profile if present
        if (typeof window !== 'undefined') {
          const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
          if (savedUserId) {
            const user = db.getUserById(savedUserId);
            if (user) {
              setCurrentUser(user);
              const donor = db.getDonorByUserId(user.id);
              setCurrentDonor(donor || null);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.error('Session sync error', e);
      }

      // 3. Website is live: Guests start unauthenticated (null)
      setCurrentUser(null);
      setCurrentDonor(null);
      setIsLoading(false);
    }

    initAuth();
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
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
  };

  const login = (email: string, role?: UserRole): boolean => {
    let user = db.getUserByEmail(email);
    if (!user) {
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
      currentUser: null,
      currentDonor: null,
      isAuthenticated: false,
      isLoading: false,
      loginAsPersona: () => {},
      loginAsGuest: () => {},
      login: () => true,
      register: () => ({} as User),
      logout: () => {},
      refreshUserData: () => {},
    };
  }
  return context;
}
