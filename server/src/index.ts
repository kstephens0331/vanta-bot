// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Defaults ----------
const DEFAULTS = {
  outreach_daily_limit: 100,
  max_cities_ahead: 2,
  followup_cadence_days: 7,
  auto_send_after_qa: false,
  require_human_approval: false,
  escalation_email_only: false,
  stripe_mode: 'live' as 'live' | 'test',
};

// Helper to read + merge settings
async function loadMergedSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('key,value')
    .order('key', { ascending: true });

  if (error) throw new Error(error.message);

  const fromDb: Record<string, unknown> = {};
  for (const row of data ?? []) {
    (fromDb as any)[row.key] =
      typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
  }
  return { ...DEFAULTS, ...fromDb };
}

// ---------- Health ----------
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    env: process.env.APP_ENV ?? 'dev',
    now: new Date().toISOString(),
  });
});

// ---------- Settings (GET) ----------
app.get('/settings', async (_req, res) => {
  try {
    const merged = await loadMergedSettings();
    res.json(merged);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Failed to load settings' });
  }
});

// ---------- Settings (POST) ----------
type Incoming = Partial<{
  outreach_daily_limit: number;
  max_cities_ahead: number;
  followup_cadence_days: number;
  auto_send_after_qa: boolean;
  require_human_approval: boolean;
  escalation_email_only: boolean;
  stripe_mode: 'live' | 'test';
}>;

const ALLOWED_KEYS = new Set<keyof Incoming>([
  'outreach_daily_limit',
  'max_cities_ahead',
  'followup_cadence_days',
  'auto_send_after_qa',
  'require_human_approval',
  'escalation_email_only',
  'stripe_mode',
]);

app.post('/settings', async (req, res) => {
  try {
    const body: Incoming = req.body ?? {};
    const rows: Array<{ key: string; value: any }> = [];

    for (const [k, v] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(k as keyof Incoming)) continue;

      // light validation
      if (
        ['outreach_daily_limit', 'max_cities_ahead', 'followup_cadence_days'].includes(k) &&
        typeof v !== 'number'
      ) return res.status(400).json({ error: `${k} must be a number` });

      if (
        ['auto_send_after_qa', 'require_human_approval', 'escalation_email_only'].includes(k) &&
        typeof v !== 'boolean'
      ) return res.status(400).json({ error: `${k} must be a boolean` });

      if (k === 'stripe_mode' && v !== 'live' && v !== 'test') {
        return res.status(400).json({ error: `stripe_mode must be 'live' or 'test'` });
      }

      rows.push({ key: k, value: v });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No valid keys provided' });
    }

    const { error } = await supabase
      .from('settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) throw new Error(error.message);

    const merged = await loadMergedSettings();
    res.json(merged);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Failed to save settings' });
  }
});

// ---------- Add-ons ----------
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
