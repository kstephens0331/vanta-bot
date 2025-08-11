import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  try {
    const body = await req.json().catch(()=> ({}));
    const token = body.token ?? new URL(req.url).searchParams.get("t");
    if (!token) return new Response("Missing token", { status: 400 });
    const [kind,value] = atob(token).split(":");
    if (!kind || !value) return new Response("Bad token", { status: 400 });
    await supabase.from("dnc_entities").insert({ kind, value, reason: "unsubscribe_click" });
    await supabase.from("events").insert({ topic: "unsubscribe.click", payload: { kind, value } });
    return new Response("You have been unsubscribed. Thank you.", { status: 200 });
  } catch {
    return new Response("Error", { status: 500 });
  }
});
