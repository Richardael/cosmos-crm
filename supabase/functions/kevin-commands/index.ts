import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const STAGE_MAP: Record<string, { stage: string; label: string }> = {
  "1": { stage: "contactado", label: "📞 Contactado" },
  "2": { stage: "reunion", label: "📅 Reunión agendada" },
  "3": { stage: "propuesta", label: "📋 Propuesta enviada" },
  "4": { stage: "cerrado_lost", label: "❌ No interesado" },
  "5": { stage: "prospecto", label: "⏸️ Ignorado por ahora" },
};

Deno.serve(async (req: Request) => {
  // Evolution siempre espera 200
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response("ok", { status: 200 });
  }

  const data = payload?.data as Record<string, unknown> | undefined;

  // Ignorar mensajes propios (Evolution echo)
  if ((data?.key as Record<string, unknown>)?.fromMe === true) {
    return new Response("ok", { status: 200 });
  }

  const senderJid = String(
    (data?.key as Record<string, unknown>)?.remoteJid ?? "",
  );
  const senderNumber = senderJid.replace("@s.whatsapp.net", "");
  const rawText = String(
    (data?.message as Record<string, unknown>)?.conversation ??
      (
        (data?.message as Record<string, unknown>)
          ?.extendedTextMessage as Record<string, unknown>
      )?.text ??
      "",
  ).trim();

  if (!senderNumber || !rawText) return new Response("ok", { status: 200 });

  const KEVIN_PHONE = (Deno.env.get("KEVIN_PHONE") ?? "").replace(
    /[\s+\-()]/g,
    "",
  );

  // Solo Kevin puede ejecutar comandos (compara los últimos 8 dígitos)
  if (!senderNumber.endsWith(KEVIN_PHONE.slice(-8))) {
    return new Response("ok", { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const EVOLUTION_URL = Deno.env.get("EVOLUTION_URL")!;
  const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE")!;
  const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY")!;

  async function sendToKevin(text: string): Promise<boolean> {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8_000);
    try {
      const res = await fetch(
        `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            apikey: EVOLUTION_API_KEY,
          },
          body: JSON.stringify({ number: senderNumber, text }),
        },
      );
      await supabase
        .from("whatsapp_messages")
        .insert({
          direction: "outbound",
          message_type: "kevin_reply",
          phone_number: KEVIN_PHONE,
          message_text: text,
          status: res.ok ? "sent" : "failed",
        })
        .catch(() => {});
      return res.ok;
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === "AbortError";
      console.error(
        isTimeout ? "sendToKevin timeout (8s)" : "sendToKevin error:",
        err,
      );
      return false;
    }
  }

  // Log el mensaje entrante de Kevin
  await supabase.from("whatsapp_messages").insert({
    direction: "inbound",
    message_type: "kevin_command",
    phone_number: KEVIN_PHONE,
    message_text: rawText,
    status: "delivered",
  });

  // Ayuda
  if (["?", "ayuda", "help"].includes(rawText.toLowerCase())) {
    await sendToKevin(
      `*Comandos NeonBot* ⚡\n\n` +
        `1️⃣  Ya lo contacté\n` +
        `2️⃣  Reunión agendada\n` +
        `3️⃣  Propuesta enviada\n` +
        `4️⃣  No está interesado\n` +
        `5️⃣  Ignorar por ahora\n\n` +
        `_Responde con el número cuando recibas un recordatorio._`,
    );
    return new Response("ok", { status: 200 });
  }

  const command = STAGE_MAP[rawText];
  if (!command) return new Response("ok", { status: 200 });

  // Buscar la última notificación enviada (el deal más reciente de Kevin)
  const { data: lastNotif } = await supabase
    .from("kevin_notifications")
    .select("deal_id")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastNotif) {
    await sendToKevin("No encontré ningún lead pendiente reciente.");
    return new Response("ok", { status: 200 });
  }

  // Leer deal actual para el log de stage_before
  const { data: dealBefore } = await supabase
    .from("deals")
    .select("stage")
    .eq("id", lastNotif.deal_id)
    .single();

  // Actualizar stage del deal
  const { data: deal, error } = await supabase
    .from("deals")
    .update({ stage: command.stage })
    .eq("id", lastNotif.deal_id)
    .select("name, contact_ids")
    .single();

  if (error || !deal) {
    console.error("Error actualizando deal:", error);
    await sendToKevin("Error al actualizar. Revisa Neon CRM directamente.");
    return new Response("ok", { status: 200 });
  }

  // Actualizar el log entrante con contexto de stage
  await supabase
    .from("whatsapp_messages")
    .update({
      deal_id: lastNotif.deal_id,
      contact_id: deal.contact_ids?.[0] ?? null,
      stage_before: dealBefore?.stage ?? null,
      stage_after: command.stage,
    })
    .eq("direction", "inbound")
    .eq("message_type", "kevin_command")
    .eq("message_text", rawText)
    .order("created_at", { ascending: false })
    .limit(1);

  // Nota en contact_notes
  if (deal.contact_ids?.length) {
    await supabase.from("contact_notes").insert({
      contact_id: deal.contact_ids[0],
      text: `Kevin actualizó desde WhatsApp: ${command.label}\n_Respuesta automática al recordatorio NeonBot_`,
      date: new Date().toISOString(),
    });
  }

  // Confirmación a Kevin
  await sendToKevin(
    `${command.label}\n\n` +
      `*${deal.name}* actualizado en Neon CRM. ✅\n` +
      `https://crm.arcanohub.com`,
  );

  return new Response("ok", { status: 200 });
});
