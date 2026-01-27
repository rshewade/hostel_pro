/**
 * Supabase Server Client
 *
 * Creates a Supabase client for use in API routes with service role key.
 * This client bypasses Row Level Security (RLS) - use with caution.
 *
 * IMPORTANT: A fresh client is created for each request to avoid state
 * pollution between requests (e.g., auth state affecting subsequent queries).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a fresh Supabase client for server-side operations.
 * Uses service role key to bypass RLS for admin operations.
 *
 * NOTE: Each call creates a new client instance to prevent auth state
 * from one request affecting subsequent requests.
 */
export function createServerClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Alias for backward compatibility
 */
export const supabase = () => createServerClient();
