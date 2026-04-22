import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const EVOLUTION_URL = Deno.env.get("EVOLUTION_URL")!;
  const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE")!;
  const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY")!;
  const KEVIN_PHONE = Deno.env.get("KEVIN_PHONE")!;

  const { data: leads, error } = await supabase.rpc("get_kevin_followups");
  if (error) {
    console.error("get_kevin_followups error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  if (!leads?.length) {
    return new Response(
      JSON.stringify({ sent: 0, message: "No hay leads pendientes hoy" }),
      { status: 200 },
    );
  }

  let sent = 0;

  for (const lead of leads) {
    const dayType = lead.days_since_created as 1 | 3 | 7;

    // Deduplicar: solo una notificación por (deal, día)
    const { data: existing } = await supabase
      .from("kevin_notifications")
      .select("id")
      .eq("deal_id", lead.deal_id)
      .eq("day_type", dayType)
      .maybeSingle();
    if (existing) continue;

    const msgText = buildKevinReminder(lead, dayType);
    const cleanNum = KEVIN_PHONE.replace(/[\s+\-()]/g, "");

    let evolutionMsgId: string | null = null;
    let status: "sent" | "failed" = "failed";

    try {
      const res = await fetch(
        `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: EVOLUTION_API_KEY,
          },
          body: JSON.stringify({ number: cleanNum, text: msgText }),
        },
      );
      if (res.ok) {
        const body = await res.json();
        evolutionMsgId = body?.key?.id ?? null;
        status = "sent";
        sent++;
      } else {
        console.error("Evolution error:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Evolution fetch error:", err);
    }

    // Log en whatsapp_messages
    await supabase.from("whatsapp_messages").insert({
      contact_id: lead.contact_id,
      deal_id: lead.deal_id,
      direction: "outbound",
      message_type: `scheduler_d${dayType}`,
      phone_number: KEVIN_PHONE,
      message_text: msgText,
      status,
      evolution_message_id: evolutionMsgId,
    });

    // Registrar deduplicación solo si se envió correctamente
    if (status === "sent") {
      await supabase
        .from("kevin_notifications")
        .insert({ deal_id: lead.deal_id, day_type: dayType });
    }
  }

  return new Response(JSON.stringify({ sent, total: leads.length }), {
    status: 200,
  });
});

// ─── Mensaje para Kevin ───────────────────────────────────────────────────────

interface Lead {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  deal_id: number;
  deal_name: string;
  deal_description: string;
  deal_amount: number;
  days_since_created: number;
}

const BUDGET_LABELS: Record<number, string> = {
  300: "Menos de $500",
  1000: "$500–$1,500",
  3000: "$1,500–$5,000",
  7500: "$5,000+",
};

function buildKevinReminder(lead: Lead, day: 1 | 3 | 7): string {
  const name = `${lead.first_name} ${lead.last_name}`.trim();
  const budget = BUDGET_LABELS[lead.deal_amount] ?? `$${lead.deal_amount}`;
  const intro =
    day === 1
      ? "Entró ayer — primer seguimiento."
      : day === 3
        ? "Lleva 3 días sin respuesta."
        : "7 días sin contacto — último intento recomendado.";

  return [
    `⚡ *Seguimiento D${day} — ${name}*`,
    `_${intro}_`,
    ``,
    `📋 ${lead.deal_name}`,
    lead.deal_description
      ? `📝 ${lead.deal_description.substring(0, 80)}${lead.deal_description.length > 80 ? "…" : ""}`
      : null,
    `💰 ${budget}`,
    ``,
    `📧 ${lead.email}`,
    lead.phone ? `📱 ${lead.phone}` : null,
    ``,
    `*¿Qué hago con este lead?*`,
    `1️⃣  Ya lo contacté`,
    `2️⃣  Reunión agendada`,
    `3️⃣  Propuesta enviada`,
    `4️⃣  No está interesado`,
    `5️⃣  Ignorar por ahora`,
    ``,
    `_Responde con el número_`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}
