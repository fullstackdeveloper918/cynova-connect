import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase admin client
export const initSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};