// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';
import { maybeRequireAdmin } from './auth.js';

const app = express();
app.use(cors());            // allow Vercel/localhost
app.use(express.json());
app.use(maybeRequireAdmin);

// ---------- Defaults used for Phase 0 ----------
const DEFAULTS = {
  outreach_daily_limit: 100,
  max_cities_ahead: 2,
  followup_cadence_days: 7,
  auto_send_after_qa: false,
  require_human_approval: false,
  escalation_email_only: false,
  stripe_mode: 'live' as 'live' | 'test',
};

// Robustly parse only-if-JSON; otherwise return as-is
function parseMaybeJson(v: unknown) {
  if (v == null || typeof v !== 'string') return v;
  const t = v.trim();
  if (!t) return t;
  const first = t[0];
  const looksJson = `[{\"tfn0123456789-`.includes(first);
  if (!looksJson) return v;
  try { return JSON.parse(t); } catch { return v; }
}

// ---------- Health ----------
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.APP_ENV ?? 'dev', now: new Date().toISOString() });
});

// ---------- Settings ----------
app.get('/settings', async (_req, res) => {
  const { data, error } = await supabase
    .from('settings')
    .select('key,value')
    .order('key', { ascending: true });

  // If table is missing, just return defaults so UI renders
  if (error?.message?.toLowerCase().includes("could not find the table")) {
    return res.json({ ...DEFAULTS });
  }
  if (error) return res.status(500).json({ error: error.message });

  const fromDb: Record<string, unknown> = {};
  for (const row of data ?? []) {
    (fromDb as any)[row.key] = parseMaybeJson(row.value);
  }
  return res.json({ ...DEFAULTS, ...fromDb });
});

app.put('/settings', async (req, res) => {
  const incoming = (req.body ?? {}) as Partial<typeof DEFAULTS>;

  // Coerce types lightly (keeps UI logic stable)
  const normalized = {
    outreach_daily_limit: Number(incoming.outreach_daily_limit ?? DEFAULTS.outreach_daily_limit),
    max_cities_ahead: Number(incoming.max_cities_ahead ?? DEFAULTS.max_cities_ahead),
    followup_cadence_days: Number(incoming.followup_cadence_days ?? DEFAULTS.followup_cadence_days),
    auto_send_after_qa: Boolean(incoming.auto_send_after_qa ?? DEFAULTS.auto_send_after_qa),
    require_human_approval: Boolean(incoming.require_human_approval ?? DEFAULTS.require_human_approval),
    escalation_email_only: Boolean(incoming.escalation_email_only ?? DEFAULTS.escalation_email_only),
    stripe_mode: (incoming.stripe_mode === 'test' ? 'test' : 'live') as 'live' | 'test',
  };

  // Upsert each key; works whether value column is text or jsonb
  const rows = Object.entries(normalized).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });

  if (error?.message?.toLowerCase().includes("could not find the table")) {
    // If table doesn't exist yet, just return what UI expects so Phase 0 flows
    return res.json(normalized);
  }
  if (error) return res.status(500).json({ error: error.message });

  // Return the merged shape the UI displays
  res.json({ ...DEFAULTS, ...normalized });
});

// ---------- Add-ons (safe fallback if table not present) ----------
app.get('/addons', async (_req, res) => {
  const { data, error } = await supabase
    .from('pricing_addons')
    .select('code,description,hours_estimate,price,active')
    .eq('active', true)
    .order('code', { ascending: true });

  if (error?.message?.toLowerCase().includes("could not find the table")) {
    return res.json({ addons: [] });
  }
  if (error) return res.status(500).json({ error: error.message });
  res.json({ addons: data });
});

// ---------- Start ----------
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Vanta server listening on :${port}`));
