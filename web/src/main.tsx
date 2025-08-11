// web/src/main.tsx
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import { api, API_BASE } from "./lib/api";
import "./index.css";

type SettingRow = { key: string; value: any; updated_at: string };
type SettingsResp = { settings: Record<string, any>; raw: SettingRow[] };
type Addon = { code: string; description: string; hours_estimate: number; price: number; active: boolean };
type AddonsResp = { addons: Addon[] };

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
    {children}
  </div>
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ background: "rgba(255,255,255,0.06)", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.12)" }}>
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    {children}
  </section>
);

/** DASHBOARD — shows Phase-0 flags from `settings` */
const Dashboard: React.FC = () => {
  const [data, setData] = useState<SettingsResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get<SettingsResp>("/settings")
      .then((r) => setData(r.data))
      .catch((e) => setErr(e?.message ?? "Failed to load settings"));
  }, []);

  const rows = useMemo(() => {
    const s = data?.settings ?? {};
    return [
      ["Outreach Daily Limit", s["outreach.daily_limit"]?.value],
      ["Max Cities Ahead", s["discovery.max_ready_cities_ahead"]?.value],
      ["Auto-send Email after QA", s["email.auto_send_after_QA"]?.enabled ? "Enabled" : "Disabled"],
      ["Require Human Approval", s["deploy.require_human_approval"]?.enabled ? "Yes" : "No"],
      ["Stripe Mode", s["stripe.mode"]?.test ? "Test" : "Live"],
      ["Escalation: Email Only", s["escalation.email_only"]?.enabled ? "Yes" : "No"],
      ["Follow-up Cadence (days)", (s["followups.cadence_days"]?.touches ?? []).join(", ")],
    ];
  }, [data]);

  return (
    <Shell>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <Card title="Phase 0 • System Status">
          {err && <div style={{ color: "tomato" }}>{err}</div>}
          {!data && !err && <div>Loading…</div>}
          {data && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={String(k)}>
                    <td style={{ padding: "8px 6px", opacity: 0.8 }}>{k}</td>
                    <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600 }}>{String(v ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Health">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify({ ok: !!data, lastUpdated: data?.raw?.[0]?.updated_at }, null, 2)}
          </pre>
        </Card>
      </div>
    </Shell>
  );
};

/** REVENUE — shows `pricing_addons` */
const Revenue: React.FC = () => {
  const [data, setData] = useState<Addon[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get<AddonsResp>("/addons")
      .then((r) => setData(r.data.addons))
      .catch((e) => setErr(e?.message ?? "Failed to load add-ons"));
  }, []);

  return (
    <Shell>
      <Card title="Active Add-ons">
        {err && <div style={{ color: "tomato" }}>{err}</div>}
        {!data && !err && <div>Loading…</div>}
        {data && (
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
              {data.map((a) => (
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
};

const Placeholder = (name: string) => () => (
  <Shell>
    <Card title={name}><div style={{ opacity: .7 }}>Coming soon</div></Card>
  </Shell>
);

const Leads = Placeholder("Leads");
const Bots = Placeholder("Bots");
const Projects = Placeholder("Projects");

const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/revenue", element: <Revenue /> },
  { path: "/leads", element: <Leads /> },
  { path: "/bots", element: <Bots /> },
  { path: "/projects", element: <Projects /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
