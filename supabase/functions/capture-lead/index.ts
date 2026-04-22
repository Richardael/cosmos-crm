import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ─── CORS — solo arcanohub.com ────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://arcanohub.com",
  "https://www.arcanohub.com",
  "http://localhost:4321",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface LeadPayload {
  name: string;
  contactInfo: string; // email (requerido)
  phone?: string; // WhatsApp — opcional, para NeonBot
  services: string[];
  budget: string;
  description?: string;
  source?: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = {
    ...corsHeaders(origin),
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    // ── 1. Validar payload ────────────────────────────────────────────────────
    const body: LeadPayload = await req.json();

    if (!body.name?.trim() || !body.contactInfo?.trim()) {
      return new Response(
        JSON.stringify({ error: "name y contactInfo son requeridos" }),
        { status: 400, headers },
      );
    }

    if (!body.contactInfo.includes("@")) {
      return new Response(
        JSON.stringify({ error: "contactInfo debe ser un email válido" }),
        { status: 400, headers },
      );
    }

    if (!Array.isArray(body.services) || body.services.length === 0) {
      return new Response(
        JSON.stringify({ error: "services debe ser un array no vacío" }),
        { status: 400, headers },
      );
    }

    // ── 2. Cliente Supabase con service_role (bypassa RLS) ───────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const nameParts = body.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || null;

    // ── 3. Insertar contacto ──────────────────────────────────────────────────
    // email_jsonb y phone_jsonb reemplazaron las columnas simples (ver migraciones)
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email_jsonb: [{ email: body.contactInfo.toLowerCase(), type: "Work" }],
        phone_jsonb: body.phone
          ? [{ number: body.phone, type: "Mobile" }]
          : null,
        source: "web",
        background: `Lead capturado desde arcanohub.com el ${new Date().toLocaleDateString("es-VE", { timeZone: "America/Caracas" })}`,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (contactError) {
      console.error("Error insertando contacto:", contactError);
      return new Response(
        JSON.stringify({
          error: "Error al crear contacto",
          detail: contactError.message,
        }),
        { status: 500, headers },
      );
    }

    // ── 4. Insertar deal en pipeline ──────────────────────────────────────────
    // contact_ids es bigint[] en el schema
    const dealName = `${body.name} — ${body.services.slice(0, 2).join(", ")}`;

    // expected_closing_date es TEXT con formato YYYY-MM-DD (ver schema-audit.md)
    const closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expectedClosingDate = `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, "0")}-${String(closeDate.getDate()).padStart(2, "0")}`;

    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .insert({
        name: dealName,
        contact_ids: [contact.id],
        stage: "prospecto",
        amount: budgetToAmount(body.budget),
        currency: "USD",
        description: body.description ?? null,
        expected_closing_date: expectedClosingDate,
      })
      .select("id")
      .single();

    if (dealError) {
      console.error("Error insertando deal:", dealError);
      return new Response(
        JSON.stringify({
          error: "Error al crear deal",
          detail: dealError.message,
        }),
        { status: 500, headers },
      );
    }

    // ── 5. Crear nota en contact_notes ────────────────────────────────────────
    // La tabla es contact_notes con columna text (no notes.note)
    await supabase.from("contact_notes").insert({
      contact_id: contact.id,
      text: buildNoteText(body),
      date: new Date().toISOString(),
    });

    // ── 6. Emails via Resend ──────────────────────────────────────────────────
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const crmUrl = Deno.env.get("NEON_CRM_URL") ?? "https://crm.arcanohub.com";

    if (resendApiKey) {
      await sendEmails({
        resendApiKey,
        body,
        dealId: String(deal.id),
        crmUrl,
      });
    }

    // ── 7. Éxito ──────────────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({ success: true, contactId: contact.id, dealId: deal.id }),
      { status: 200, headers },
    );
  } catch (err) {
    console.error("Error inesperado en capture-lead:", err);
    return new Response(
      JSON.stringify({ error: "Error interno — intenta de nuevo" }),
      { status: 500, headers },
    );
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function budgetToAmount(budget: string): number {
  const map: Record<string, number> = {
    under_500: 300,
    "500_1500": 1000,
    "1500_5000": 3000,
    above_5000: 7500,
    unknown: 0,
  };
  return map[budget] ?? 0;
}

function buildNoteText(body: LeadPayload): string {
  const now = new Date();
  const proposalDeadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const fmtVE = (d: Date) =>
    d.toLocaleString("es-VE", { timeZone: "America/Caracas" });

  return [
    `📋 Lead capturado desde arcanohub.com`,
    `Servicios: ${body.services.join(", ")}`,
    `Presupuesto: ${body.budget}`,
    body.description ? `Descripción: ${body.description}` : null,
    body.source ? `Fuente: ${body.source}` : null,
    `──`,
    `⏰ Propuesta prometida antes de: ${fmtVE(proposalDeadline)}`,
    `📅 Cierre estimado: 30 días`,
    `📍 Capturado: ${fmtVE(now)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

interface SendEmailsParams {
  resendApiKey: string;
  body: LeadPayload;
  dealId: string;
  crmUrl: string;
}

async function sendEmails({
  resendApiKey,
  body,
  dealId,
  crmUrl,
}: SendEmailsParams): Promise<void> {
  const resendHeaders = {
    Authorization: `Bearer ${resendApiKey}`,
    "Content-Type": "application/json",
  };

  // Email interno a Kevin
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: resendHeaders,
    body: JSON.stringify({
      from: "Neon CRM <noreply@arcanohub.com>",
      to: ["hola@arcanohub.com"],
      subject: `⚡ Nueva cotización — ${body.name}`,
      html: `
        <div style="font-family:DM Sans,sans-serif;background:#0A0A0A;color:#FAFAFA;padding:24px;border-radius:8px;max-width:520px">
          <h2 style="color:#F5C518;margin:0 0 16px">⚡ Nuevo lead en Neon CRM</h2>
          <p style="margin:6px 0"><b>Nombre:</b> ${body.name}</p>
          <p style="margin:6px 0"><b>Contacto:</b> ${body.contactInfo}</p>
          <p style="margin:6px 0"><b>Servicios:</b> ${body.services.join(", ")}</p>
          <p style="margin:6px 0"><b>Presupuesto:</b> ${body.budget}</p>
          ${body.description ? `<p style="margin:6px 0"><b>Descripción:</b> ${body.description}</p>` : ""}
          <hr style="border-color:#2E2E2E;margin:20px 0">
          <a href="${crmUrl}/deals/${dealId}/show"
             style="background:#F5C518;color:#0A0A0A;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">
            Ver en Neon CRM →
          </a>
        </div>`,
    }),
  });

  // Email de confirmación al prospecto (contactInfo es siempre email ahora)
  {
    const firstName = body.name.trim().split(/\s+/)[0];
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: resendHeaders,
      body: JSON.stringify({
        from: "Arcano Hub <hola@arcanohub.com>",
        to: [body.contactInfo],
        subject: `Recibimos tu proyecto — Arcano Hub`,
        html: `
          <div style="font-family:DM Sans,sans-serif;background:#0A0A0A;color:#FAFAFA;padding:24px;border-radius:8px;max-width:520px">
            <h2 style="color:#F5C518;margin:0 0 16px">Recibimos tu proyecto, ${firstName}.</h2>
            <p style="color:#A0A0A0;margin:8px 0">En menos de 48 horas tienes una propuesta técnica con arquitectura, stack, entregables y precio.</p>
            <p style="color:#A0A0A0;margin:8px 0">¿Tienes dudas mientras tanto?</p>
            <p style="margin:8px 0"><a href="mailto:hola@arcanohub.com" style="color:#F5C518">hola@arcanohub.com</a></p>
            <hr style="border-color:#2E2E2E;margin:20px 0">
            <p style="color:#606060;font-size:12px;margin:0">Arcano Hub · Agencia de soluciones digitales · Venezuela</p>
          </div>`,
      }),
    });
  }
}
