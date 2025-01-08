import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fkrvvlfhdjxqadmupldb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcnZ2bGZoZGp4cWFkbXVwbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTkzODU2OCwiZXhwIjoyMDUxNTE0NTY4fQ.uGFmOuENDAl0jNjIFMPGMYZsIAzf0fZtH8zvIv5Tg4k";

export const adminSupabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);