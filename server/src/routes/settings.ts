// server/src/routes/settings.ts
import { Router } from "express";
import { supabase } from "../supabase"; // adjust if your client is exported differently

const router = Router();

// Server-side defaults to fill any missing keys from DB
const defaults = {
  outreach_daily_limit: 100,
  max_cities_ahead: 2,
  followup_cadence_days: 7,
  auto_send_after_qa: false,
  require_human_approval: false,
  escalation_email_only: false,
  stripe_mode: "live",
};

router.get("/settings", async (_req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from("settings")
      .select("key,value");

    if (error) throw error;

    const fromDb: Record<string, unknown> = Object.fromEntries(
      (rows ?? []).map((r: any) => [
        r.key,
        typeof r.value === "string"
          ? (() => {
              try {
                return JSON.parse(r.value);
              } catch {
                return r.value;
              }
            })()
          : r.value,
      ])
    );

    res.json({ ...defaults, ...fromDb });
  } catch (err) {
    console.error("GET /settings failed:", err);
    res.status(500).json({ ok: false, error: "failed_to_load_settings" });
  }
});

export default router;
