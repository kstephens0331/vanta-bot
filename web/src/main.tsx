// web/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import { request, API_BASE } from "./lib/api";
import "./index.css";

// ---------- Types ----------
type Health = { ok: boolean; env: string; now: string };
type Settings = {
  outreach_daily_limit: number;
  max_cities_ahead: number;
  followup_cadence_days: number;
  auto_send_after_qa: boolean;
  require_human_approval: boolean;
  escalation_email_only: boolean;
  stripe_mode: "live" | "test" | string;
  // tolerate any future keys
  [k: string]: unknown;
};
type Addon = {
  code: string;
  description: string;
  hours_estimate: number;
  price: number;
  active: boolean;
};

// ---------- UI helpers ----------
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

function Card(props: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section
      style={{
        background: "rgba(255,255,255,0.06)",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,.12)",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{props.title}</h3>
      {props.children}
    </section>
  );
}

// ---------- Pages ----------
function Dashboard() {
  const [health, setHealth] = React.useState<Health | null>(null);
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const h = await request<Health>("/health");
        setHealth(h);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      }
      try {
        // /settings returns a flat object with defaults merged from the server
        const s = await request<Settings>("/settings");
        setSettings(s);
      } catch (e: any) {
        setErr((prev) => prev ?? (e?.message ?? String(e)));
      }
    })();
  }, []);

  const rows: Array<[string, string | number | boolean | null]> = [
    ["Environment", health?.env ?? "—"],
    ["Server Time", health?.now ?? "—"],
    ["Daily Limit", settings?.outreach_daily_limit ?? "—"],
    ["Max Cities Ahead", settings?.max_cities_ahead ?? "—"],
    ["Follow-up Cadence (days)", settings?.followup_cadence_days ?? "—"],
    ["Auto-send after QA", settings?.auto_send_after_qa ?? "—"],
    ["Require Human Approval", settings?.require_human_approval ?? "—"],
    ["Escalation Email Only", settings?.escalation_email_only ?? "—"],
    ["Stripe Mode", settings?.stripe_mode ?? "—"],
  ];

  return (
    <Shell>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <Card title="Phase 0 • System Status">
          {err && <div style={{ color: "tomato" }}>{err}</div>}
          {!health && !settings && !err && <div>Loading…</div>}
          {(health || settings) && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: "8px 6px", opacity: 0.8 }}>{k}</td>
                    <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600 }}>
                      {typeof v === "boolean" ? (v ? "true" : "false") : String(v ?? "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Health (raw)">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(health, null, 2)}</pre>
        </Card>
      </div>
    </Shell>
  );
}

function Revenue() {
  const [addons, setAddons] = React.useState<Addon[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await request<{ addons: Addon[] }>("/addons");
        setAddons(res.addons ?? []);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      }
    })();
  }, []);

  return (
    <Shell>
      <Card title="Active Add-ons">
        {err && <div style={{ color: "tomato" }}>{err}</div>}
        {!addons.length && !err && <div>Loading…</div>}
        {!!addons.length && (
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

function Stub({ name }: { name: string }) {
  return (
    <Shell>
      <Card title={name}>
        <div style={{ opacity: 0.7 }}>Coming soon</div>
      </Card>
    </Shell>
  );
}

// ---------- Routes ----------
const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/revenue", element: <Revenue /> },
  { path: "/leads", element: <Stub name="Leads" /> },
  { path: "/bots", element: <Stub name="Bots" /> },
  { path: "/projects", element: <Stub name="Projects" /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
