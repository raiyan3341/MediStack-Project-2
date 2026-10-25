'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../lib/api';

export type UserRole = 'user' | 'organization' | 'admin' | 'owner';

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  profileImage?: string;
  role: UserRole;
  organizationId?: string | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  type: 'Pharmacy' | 'Hospital' | 'Clinic';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  licenseNumber?: string;
  address?: string;
  city?: string;
  area?: string;
  contactNumber?: string;
  businessEmail?: string;
  additionalNotes?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  organization: OrganizationSummary | null;
  token: string | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<OrganizationSummary | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentSession = async () => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('medistock_token') : null;
    if (!savedToken) {
      setUser(null);
      setOrganization(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(savedToken);
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        setOrganization(res.organization || null);
      } else {
        localStorage.removeItem('medistock_token');
        setUser(null);
        setOrganization(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Session check failed, clearing token');
      localStorage.removeItem('medistock_token');
      setUser(null);
      setOrganization(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSession();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('medistock_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setOrganization(res.organization || null);
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Email Login Error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.success && res.token) {
        localStorage.setItem('medistock_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setOrganization(res.organization || null);
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Email Registration Error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const res = await api.post('/auth/sync-user', {
        firebaseUid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email?.split('@')[0],
        profileImage: fbUser.photoURL || '',
      });

      if (res.success && res.token) {
        localStorage.setItem('medistock_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setOrganization(res.organization || null);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('medistock_token');
    setUser(null);
    setOrganization(null);
    setToken(null);
  };

  const refreshUser = async () => {
    await fetchCurrentSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        token,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        signInWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
