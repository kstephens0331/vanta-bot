import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import "./index.css";

const Layout = ({children}:{children:React.ReactNode}) => (
  <div style={{fontFamily:"Inter, system-ui", padding:20}}>
    <h2>Vanta • Main</h2>
    <nav style={{display:"flex", gap:12, marginBottom:16}}>
      <Link to="/">Dashboard</Link>
      <Link to="/leads">Leads</Link>
      <Link to="/bots">Bots</Link>
      <Link to="/revenue">Revenue</Link>
      <Link to="/projects">Projects</Link>
    </nav>
    <div>{children}</div>
  </div>
);

const Page = (t:string) => () => <Layout><div style={{opacity:.8}}>{t}</div></Layout>;
const Dashboard = Page("Dashboard");
const Leads = Page("Leads");
const Bots = Page("Bots");
const Revenue = Page("Revenue");
const Projects = Page("Projects");

const router = createBrowserRouter([
  { path: "/", element: <Dashboard/> },
  { path: "/leads", element: <Leads/> },
  { path: "/bots", element: <Bots/> },
  { path: "/revenue", element: <Revenue/> },
  { path: "/projects", element: <Projects/> }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
);
