import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { businessConfig } from '../config/business';

/**
 * Mobile Supabase Client
 * Connected to live production Supabase backend
 * Session persists locally via AsyncStorage
 */
export const supabase = createClient(
  businessConfig.supabase.url,
  businessConfig.supabase.publishableKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
