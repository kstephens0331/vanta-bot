import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';
import settingsRouter from './routes/settings.js';

const app = express();
app.use(cors());
app.use(express.json());

// settings routes
app.use(settingsRouter);

// health
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.APP_ENV ?? 'dev', now: new Date().toISOString() });
});

// addons
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
