import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export type CustomerType =
  | 'Retail Shop'
  | 'Reseller'
  | 'Business'
  | 'Institution'
  | 'Bulk Buyer'
  | 'Other';

export interface MobileUserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  businessName: string | null;
  gstNumber: string | null;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface RegisterInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  customerType: CustomerType;
  businessName?: string;
  gstNumber?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: MobileUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: RegisterInput) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MobileUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<MobileUserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        fullName: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
        customerType: (data.customer_type as CustomerType) || 'Retail Shop',
        businessName: data.business_name,
        gstNumber: data.gst_number,
        role: data.role || 'customer',
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Error fetching profile in AuthProvider:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user, fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    // Check existing active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).then((p) => {
          if (isMounted) {
            setProfile(p);
            setIsLoading(false);
          }
        });
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (isMounted) setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        const p = await fetchProfile(data.user.id);
        setProfile(p);
      }

      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Login failed. Please check credentials.' };
    }
  };

  const register = async (data: RegisterInput): Promise<{ error?: string }> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            phone: data.phone.trim(),
            business_name: data.businessName?.trim() || null,
            customer_type: data.customerType,
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          return { error: 'An account with this email address already exists. Please sign in instead.' };
        }
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: 'Registration failed. Please try again.' };
      }

      // Upsert profile into public.profiles
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        customer_type: data.customerType,
        business_name: data.businessName?.trim() || null,
        gst_number: data.gstNumber?.trim().toUpperCase() || null,
        role: 'customer',
      });

      if (profileError) {
        console.warn('Profile creation warning:', profileError.message);
      }

      setUser(authData.user);
      const p = await fetchProfile(authData.user.id);
      setProfile(p);

      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, profile, isLoading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
