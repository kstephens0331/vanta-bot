import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_,res)=>res.json({ok:true, env:process.env.APP_ENV||"dev"}));

const settings = {
  outreach: { daily_limit: 100 },
  discovery: { max_ready_cities_ahead: 3 },
  email: { auto_send_after_QA: true },
  deploy: { require_human_approval: true },
  stripe: { test: true }
};
app.get("/api/settings", (_,res)=>res.json(settings));

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`Vanta server on :${port}`));
