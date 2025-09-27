import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Function to get Supabase client - only creates when env vars are available
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Legacy export for compatibility - will throw error if env vars missing
export const supabase = (() => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('supabaseUrl is required.');
  }
  return client;
})();