// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';

const app = express();
app.use(cors());
app.use(express.json());

// --- Health ----------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.APP_ENV ?? 'dev', now: new Date().toISOString() });
});

// --- Settings (defaults + DB overrides) -----------------------
const DEFAULTS = {
  outreach_daily_limit: 100,
  max_cities_ahead: 2,
  followup_cadence_days: 7,
  auto_send_after_qa: false,
  require_human_approval: false,
  escalation_email_only: false,
  stripe_mode: 'live',
};

app.get('/settings', async (_req, res) => {
  const { data, error } = await supabase
    .from('settings')
    .select('key,value')
    .order('key', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const fromDb: Record<string, unknown> = {};
  for (const row of data ?? []) {
    (fromDb as any)[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
  }

  // return top-level keys so the UI can read them directly
  return res.json({ ...DEFAULTS, ...fromDb });
});

// --- Add-ons ---------------------------------------------------
app.get('/addons', async (_req, res) => {
  const { data, error } = await supabase
    .from('pricing_addons')
    .select('code,description,hours_estimate,price,active')
    .eq('active', true)
    .order('code', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ addons: data });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Vanta server listening on :${port}`));
