import { Router } from 'express';
import { supabase } from '../supabase.js';

const router = Router();

router.get('/settings', async (_req, res) => {
  const defaults = {
    outreach_daily_limit: 100,
    max_cities_ahead: 2,
    followup_cadence_days: 7,
    auto_send_after_qa: false,
    require_human_approval: false,
    escalation_email_only: false,
    stripe_mode: 'live',
  };

  const { data, error } = await supabase
    .from('settings')
    .select('key,value');

  if (error) return res.status(500).json({ error: error.message });

  const fromDb = Object.fromEntries(
    (data ?? []).map(r => [r.key, typeof r.value === 'string' ? safeParse(r.value) : r.value])
  );

  res.json({ ...defaults, ...fromDb });
});

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return s; }
}

export default router;
