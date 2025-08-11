"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// web/src/main.tsx
var react_1 = require("react");
var client_1 = require("react-dom/client");
var react_router_dom_1 = require("react-router-dom");
var api_1 = require("./lib/api");
require("./index.css");
var Shell = function (_a) {
    var children = _a.children;
    return (<div style={{ fontFamily: "Inter, system-ui", padding: 20, maxWidth: 1100, margin: "0 auto" }}>
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>Vanta • Admin</h2>
      <small style={{ opacity: 0.7 }}>API: {api_1.API_BASE}</small>
    </header>
    <nav style={{ display: "flex", gap: 14, marginBottom: 18 }}>
      <react_router_dom_1.Link to="/">Dashboard</react_router_dom_1.Link>
      <react_router_dom_1.Link to="/leads">Leads</react_router_dom_1.Link>
      <react_router_dom_1.Link to="/bots">Bots</react_router_dom_1.Link>
      <react_router_dom_1.Link to="/revenue">Revenue</react_router_dom_1.Link>
      <react_router_dom_1.Link to="/projects">Projects</react_router_dom_1.Link>
    </nav>
    {children}
  </div>);
};
var Card = function (_a) {
    var title = _a.title, children = _a.children;
    return (<section style={{ background: "rgba(255,255,255,0.06)", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.12)" }}>
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    {children}
  </section>);
};
/** DASHBOARD — shows Phase-0 flags from `settings` */
var Dashboard = function () {
    var _a, _b;
    var _c = (0, react_1.useState)(null), data = _c[0], setData = _c[1];
    var _d = (0, react_1.useState)(null), err = _d[0], setErr = _d[1];
    (0, react_1.useEffect)(function () {
        api_1.api.get("/settings")
            .then(function (r) { return setData(r.data); })
            .catch(function (e) { var _a; return setErr((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : "Failed to load settings"); });
    }, []);
    var rows = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var s = (_a = data === null || data === void 0 ? void 0 : data.settings) !== null && _a !== void 0 ? _a : {};
        return [
            ["Outreach Daily Limit", (_b = s["outreach.daily_limit"]) === null || _b === void 0 ? void 0 : _b.value],
            ["Max Cities Ahead", (_c = s["discovery.max_ready_cities_ahead"]) === null || _c === void 0 ? void 0 : _c.value],
            ["Auto-send Email after QA", ((_d = s["email.auto_send_after_QA"]) === null || _d === void 0 ? void 0 : _d.enabled) ? "Enabled" : "Disabled"],
            ["Require Human Approval", ((_e = s["deploy.require_human_approval"]) === null || _e === void 0 ? void 0 : _e.enabled) ? "Yes" : "No"],
            ["Stripe Mode", ((_f = s["stripe.mode"]) === null || _f === void 0 ? void 0 : _f.test) ? "Test" : "Live"],
            ["Escalation: Email Only", ((_g = s["escalation.email_only"]) === null || _g === void 0 ? void 0 : _g.enabled) ? "Yes" : "No"],
            ["Follow-up Cadence (days)", ((_j = (_h = s["followups.cadence_days"]) === null || _h === void 0 ? void 0 : _h.touches) !== null && _j !== void 0 ? _j : []).join(", ")],
        ];
    }, [data]);
    return (<Shell>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <Card title="Phase 0 • System Status">
          {err && <div style={{ color: "tomato" }}>{err}</div>}
          {!data && !err && <div>Loading…</div>}
          {data && (<table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {rows.map(function (_a) {
                var k = _a[0], v = _a[1];
                return (<tr key={String(k)}>
                    <td style={{ padding: "8px 6px", opacity: 0.8 }}>{k}</td>
                    <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600 }}>{String(v !== null && v !== void 0 ? v : "—")}</td>
                  </tr>);
            })}
              </tbody>
            </table>)}
        </Card>

        <Card title="Health">
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify({ ok: !!data, lastUpdated: (_b = (_a = data === null || data === void 0 ? void 0 : data.raw) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.updated_at }, null, 2)}
          </pre>
        </Card>
      </div>
    </Shell>);
};
/** REVENUE — shows `pricing_addons` */
var Revenue = function () {
    var _a = (0, react_1.useState)(null), data = _a[0], setData = _a[1];
    var _b = (0, react_1.useState)(null), err = _b[0], setErr = _b[1];
    (0, react_1.useEffect)(function () {
        api_1.api.get("/addons")
            .then(function (r) { return setData(r.data.addons); })
            .catch(function (e) { var _a; return setErr((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : "Failed to load add-ons"); });
    }, []);
    return (<Shell>
      <Card title="Active Add-ons">
        {err && <div style={{ color: "tomato" }}>{err}</div>}
        {!data && !err && <div>Loading…</div>}
        {data && (<table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Code</th>
                <th style={{ textAlign: "left" }}>Description</th>
                <th>Hours</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {data.map(function (a) { return (<tr key={a.code}>
                  <td style={{ padding: 8 }}>{a.code}</td>
                  <td style={{ padding: 8, opacity: 0.85 }}>{a.description}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{a.hours_estimate}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>${a.price}</td>
                </tr>); })}
            </tbody>
          </table>)}
      </Card>
    </Shell>);
};
var Placeholder = function (name) { return function () { return (<Shell>
    <Card title={name}><div style={{ opacity: .7 }}>Coming soon</div></Card>
  </Shell>); }; };
var Leads = Placeholder("Leads");
var Bots = Placeholder("Bots");
var Projects = Placeholder("Projects");
var router = (0, react_router_dom_1.createBrowserRouter)([
    { path: "/", element: <Dashboard /> },
    { path: "/revenue", element: <Revenue /> },
    { path: "/leads", element: <Leads /> },
    { path: "/bots", element: <Bots /> },
    { path: "/projects", element: <Projects /> },
]);
client_1.default.createRoot(document.getElementById("root")).render(<react_1.default.StrictMode>
    <react_router_dom_1.RouterProvider router={router}/>
  </react_1.default.StrictMode>);
