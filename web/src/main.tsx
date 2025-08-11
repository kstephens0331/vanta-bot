// web/src/main.tsx
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import { request, API_BASE } from "./lib/api";
import "./index.css";

type Settings = {
  outreach_daily_limit: number;
  max_cities_ahead: number;
  followup_cadence_days: number;
  auto_send_after_qa: boolean;
  require_human_approval: boolean;
  escalation_email_only: boolean;
  stripe_mode: "live" | "test";
};

type Addon = {
  code: string;
  description: string;
  hours_estimate: number;
  price: number;
  active: boolean;
};

function Shell(props: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "Inter, system-ui", padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Vanta • Admin</h2>
        <small style={{ opacity: 0.7 }}>API: {API_BASE}</small>
      </header>
      <nav style={{ display: "flex", gap: 14, marginBottom: 18 }}>
        <Link to="/">Dashboard</Link>
        <Link to="/leads">Leads</Link>
        <Link to="/bots">Bots</Link>
        <Link to="/revenue">Revenue</Link>
        <Link to="/projects">Projects</Link>
      </nav>
      {props.children}
    </div>
  );
}

function Card(props: { title: string; children?: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section style={{ background: "rgba(255,255,255,0.06)", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.12)", marginBottom: 16 }}>
      <h3 style={{ marginTop: 0 }}>{props.title}</h3>
      <div>{props.children}</div>
      {props.footer && <div style={{ marginTop: 12, opacity: 0.8 }}>{props.footer}</div>}
    </section>
  );
}

function StatusRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td style={{ padding: "8px 6px", opacity: 0.8 }}>{label}</td>
      <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600 }}>{value}</td>
    </tr>
  );
}

function Dashboard() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [initial, setInitial] = useState<Settings | null>(null);
  const [addons, setAddons] = useState<Addon[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // load settings
  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const s = await request<Settings>("/settings");
        setSettings(s);
        setInitial(s);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load settings");
      }
    })();
  }, []);

  // load addons (non-blocking)
  useEffect(() => {
    (async () => {
      try {
        const { addons } = await request<{ addons: Addon[] }>("/addons");
        setAddons(addons);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const dirty = useMemo(() => {
    if (!settings || !initial) return false;
    return JSON.stringify(settings) !== JSON.stringify(initial);
  }, [settings, initial]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setErr(null);
    try {
      const merged = await request<Settings>("/settings", {
        method: "PUT",           // <- keep in sync with server route
        data: settings,          // axios will JSON-encode
      });
      setSettings(merged);
      setInitial(merged);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <Card
          title="Phase 0 • System Status"
          footer={
            <>
              {err && <div style={{ color: "tomato" }}>{err}</div>}
              {!settings && !err && <div>Loading…</div>}
              {savedAt && <div>Saved at {savedAt}</div>}
            </>
          }
        >
          {settings && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <StatusRow label="Environment" value={import.meta.env.MODE ?? "dev"} />
                <StatusRow label="Server Time" value={<time>{new Date().toISOString()}</time>} />
                <StatusRow label="Daily Limit" value={settings.outreach_daily_limit} />
                <StatusRow label="Max Cities Ahead" value={settings.max_cities_ahead} />
                <StatusRow label="Follow-up Cadence (days)" value={settings.followup_cadence_days} />
                <StatusRow label="Auto-send after QA" value={String(settings.auto_send_after_qa)} />
                <StatusRow label="Require Human Approval" value={String(settings.require_human_approval)} />
                <StatusRow label="Escalation Email Only" value={String(settings.escalation_email_only)} />
                <StatusRow label="Stripe Mode" value={settings.stripe_mode} />
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Edit Settings">
          {!settings ? (
            <div>Loading…</div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
              style={{ display: "grid", gap: 12 }}
            >
              <label style={{ display: "grid", gap: 6 }}>
                <span>Daily Limit</span>
                <input
                  type="number"
                  value={settings.outreach_daily_limit}
                  onChange={(e) =>
                    setSettings((s) => s && { ...s, outreach_daily_limit: Number(e.target.value) })
                  }
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Max Cities Ahead</span>
                <input
                  type="number"
                  value={settings.max_cities_ahead}
                  onChange={(e) =>
                    setSettings((s) => s && { ...s, max_cities_ahead: Number(e.target.value) })
                  }
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Follow-up Cadence (days)</span>
                <input
                  type="number"
                  value={settings.followup_cadence_days}
                  onChange={(e) =>
                    setSettings((s) => s && { ...s, followup_cadence_days: Number(e.target.value) })
                  }
                />
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={settings.auto_send_after_qa}
                  onChange={(e) =>
                    setSettings((s) => s && { ...s, auto_send_after_qa: e.target.checked })
                  }
                />
                <span>Auto-send after QA</span>
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={settings.require_human_approval}
                  onChange={(e) =>
                    setSettings((s) => s && { ...s, require_human_approval: e.target.checked })
                  }
                />
                <span>Require Human Approval</span>
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={settings.escalation_email_only}
                  onChange={(e) =>
                    setSettings((s) => s && { ...s, escalation_email_only: e.target.checked })
                  }
                />
                <span>Escalation Email Only</span>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Stripe Mode</span>
                <select
                  value={settings.stripe_mode}
                  onChange={(e) =>
                    setSettings((s) => s && { ...s, stripe_mode: e.target.value as Settings["stripe_mode"] })
                  }
                >
                  <option value="live">live</option>
                  <option value="test">test</option>
                </select>
              </label>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" disabled={!dirty || saving}>
                  {saving ? "Saving…" : "Save settings"}
                </button>
                {dirty && !saving && <span style={{ opacity: 0.7 }}>Unsaved changes</span>}
              </div>
            </form>
          )}
        </Card>
      </div>

      <Card title="Active Add-ons">
        {!addons ? (
          <div>Loading…</div>
        ) : addons.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No active add-ons</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Code</th>
                <th style={{ textAlign: "left" }}>Description</th>
                <th>Hours</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {addons.map((a) => (
                <tr key={a.code}>
                  <td style={{ padding: 8 }}>{a.code}</td>
                  <td style={{ padding: 8, opacity: 0.85 }}>{a.description}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{a.hours_estimate}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>${a.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </Shell>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <Shell>
      <Card title={name}>
        <div style={{ opacity: 0.7 }}>Coming soon</div>
      </Card>
    </Shell>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/revenue", element: <Placeholder name="Revenue" /> },
  { path: "/leads", element: <Placeholder name="Leads" /> },
  { path: "/bots", element: <Placeholder name="Bots" /> },
  { path: "/projects", element: <Placeholder name="Projects" /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
