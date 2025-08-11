import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';

const app = express();

/** ---- CORS (allow your Vercel site + localhost) ---- */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://vanta-bot-git-master-kstephens0331s-projects.vercel.app',
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl/Postman
      if (ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Preflight for all routes
app.options('*', cors());

app.use(express.json());

/** ---- Health ---- */
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.APP_ENV ?? 'dev', now: new Date().toISOString() });
});

/** ---- Settings (defaults + DB overrides) ---- */
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
    let v = row.value as unknown;
    if (typeof v === 'string') {
      try { v = JSON.parse(v); } catch { /* keep raw string */ }
    }
    (fromDb as any)[row.key] = v;
  }

  res.json({ ...DEFAULTS, ...fromDb });
});

/** ---- Add-ons ---- */
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
