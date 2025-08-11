// server/src/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service role used server-side only

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
