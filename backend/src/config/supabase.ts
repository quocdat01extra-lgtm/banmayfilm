import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// We use the service role key on the backend to bypass RLS policies
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
