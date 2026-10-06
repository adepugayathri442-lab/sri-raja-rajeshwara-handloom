'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { CustomerType, UserRole } from '@/types/database.types';
import { getAuthCallbackUrl, AUTH_NEXT_COOKIE_NAME } from '@/lib/auth/auth-urls';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  businessName: string | null;
  gstNumber: string | null;
  role: UserRole;
  createdAt: string;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  businessName?: string;
  customerType: CustomerType;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; role?: UserRole }>;
  register: (data: RegisterData) => Promise<{ error?: string }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isConfigured = isSupabaseConfigured();
  const [isLoading, setIsLoading] = useState<boolean>(() => isConfigured);

  const supabase = useMemo(() => {
    return isConfigured ? createClient() : null;
  }, [isConfigured]);

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const isDesignatedAdminUid =
        userId === '6eda0e3c-732e-4c1f-839a-01b019a6a49e' ||
        userId === '2bd6cdb5-e013-411d-92f4-23e787c27c4c';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        // If profile doesn't exist yet, but user is designated admin, self-heal and create profile
        if (isDesignatedAdminUid) {
          const adminEmail =
            userId === '6eda0e3c-732e-4c1f-839a-01b019a6a49e'
              ? 'adepugayathri442@gmail.com'
              : 'adepugayathri28@gmail.com';

          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              full_name: 'Gayathri Adepu',
              phone: '',
              email: adminEmail,
              customer_type: 'Business',
              business_name: 'Sri Raja Rajeshwara Handloom',
              role: 'admin',
            })
            .select()
            .maybeSingle();

          if (newProfile) {
            return {
              id: newProfile.id,
              fullName: newProfile.full_name,
              phone: newProfile.phone,
              email: newProfile.email,
              customerType: newProfile.customer_type as CustomerType,
              businessName: newProfile.business_name,
              gstNumber: newProfile.gst_number,
              role: 'admin',
              createdAt: newProfile.created_at,
            };
          }
        }
        return null;
      }

      // Check if user is one of the designated admins and ensure role = 'admin'
      const isDesignatedAdmin =
        isDesignatedAdminUid ||
        data.email?.toLowerCase() === 'adepugayathri442@gmail.com' ||
        data.email?.toLowerCase() === 'adepugayathri28@gmail.com';

      let role = (data.role as UserRole) || 'customer';
      if (isDesignatedAdmin && role !== 'admin') {
        role = 'admin';
        supabase.from('profiles').update({ role: 'admin' }).eq('id', userId).then();
      }

      return {
        id: data.id,
        fullName: data.full_name,
        phone: data.phone,
        email: data.email,
        customerType: data.customer_type as CustomerType,
        businessName: data.business_name,
        gstNumber: data.gst_number,
        role,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).then((p) => {
          if (isMounted) setProfile(p);
          if (isMounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        if (isMounted) setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const login = async (email: string, password: string): Promise<{ error?: string; role?: UserRole }> => {
    if (!supabase) {
      return { error: 'Supabase credentials are not yet configured in environment variables (.env.local).' };
    }

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
        return { role: p?.role };
      }

      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Login failed. Please try again.' };
    }
  };

  const register = async (data: RegisterData): Promise<{ error?: string }> => {
    if (!supabase) {
      return { error: 'Supabase credentials are not yet configured in environment variables (.env.local).' };
    }

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
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: 'Registration failed to create user. Please try again.' };
      }

      // Upsert into public.profiles
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        customer_type: data.customerType,
        business_name: data.businessName?.trim() || null,
        role: 'customer',
      });

      if (profileError) {
        // If trigger already handled this, ignore duplicate key error
        if (!profileError.message.includes('duplicate')) {
          console.warn('Profile creation warning:', profileError.message);
        }
      }

      setUser(authData.user);
      const p = await fetchProfile(authData.user.id);
      setProfile(p);

      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Registration failed. Please try again.' };
    }
  };

  const signInWithGoogle = async (redirectTo?: string): Promise<{ error?: string }> => {
    if (!supabase) {
      return { error: 'Supabase credentials are not yet configured in environment variables (.env.local).' };
    }

    try {
      const isClientAdmin =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

      const defaultTarget = isClientAdmin ? '/admin' : '/account';
      const safeRedirect = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : defaultTarget;

      // Store requested redirect in cookie so the OAuth callback route can retrieve it
      // without attaching query parameters to the OAuth redirect URL
      if (typeof document !== 'undefined') {
        const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${AUTH_NEXT_COOKIE_NAME}=${encodeURIComponent(safeRedirect)}; path=/; max-age=600; SameSite=Lax${isSecure}`;
      }

      // Exact production callback URL: https://sri-raja-rajeshwara-handloom.vercel.app/auth/callback
      const callbackUrl = getAuthCallbackUrl();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.url) {
        window.location.href = data.url;
      }

      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Google sign in failed. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const isDesignatedAdmin =
    user?.id === '6eda0e3c-732e-4c1f-839a-01b019a6a49e' ||
    user?.id === '2bd6cdb5-e013-411d-92f4-23e787c27c4c' ||
    user?.email?.toLowerCase() === 'adepugayathri442@gmail.com' ||
    user?.email?.toLowerCase() === 'adepugayathri28@gmail.com';

  const role = (profile?.role ?? (isDesignatedAdmin ? 'admin' : null)) as UserRole | null;
  const isAdmin = role === 'admin' || isDesignatedAdmin;
  const isAuthenticated = Boolean(user);

  const value: AuthContextValue = {
    user,
    profile,
    role,
    isAdmin,
    isAuthenticated,
    isLoading,
    isConfigured,
    login,
    register,
    signInWithGoogle,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
