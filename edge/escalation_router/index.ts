import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const TRIGGERS = ["call me","phone call","schedule a call","urgent","asap","immediately","escalate","supervisor","manager","need to speak"];

function isEscalation(text: string) {
  const t = (text||"").toLowerCase();
  return TRIGGERS.some(k => t.includes(k));
}

serve(async (req) => {
  try {
    const { threadId, from, subject, snippet, body } = await req.json();
    const text = [subject, snippet, body].filter(Boolean).join("\n");
    const escalated = isEscalation(text);
    if (escalated) {
      await supabase.from("events").insert({ topic: "email.escalation", payload: { threadId, from, subject, snippet } });
      await supabase.from("audit_logs").insert({ actor:"system", action:"escalation_flagged", details:{ threadId, from, subject } });
    }
    return new Response(JSON.stringify({ escalated }), { status: 200 });
  } catch {
    return new Response("Error", { status: 500 });
  }
});
