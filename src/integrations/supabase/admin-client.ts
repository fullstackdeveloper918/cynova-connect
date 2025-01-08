import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fkrvvlfhdjxqadmupldb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const adminSupabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);