import 'dotenv/config'; // ensure .env is loaded before we read process.env
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('Missing SUPABASE_URL env var');
if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var');

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});