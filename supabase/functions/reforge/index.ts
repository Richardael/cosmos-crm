// Reforge Integration — Read-only API for Artoria (Telegram bot, Arcano Hub)
// Auth: X-Reforge-Key header validated against REFORGE_API_KEY env var
// Deployed at: {SUPABASE_URL}/functions/v1/reforge/{pipeline|clients|summary}

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ── Config ──────────────────────────────────────────────────────────────────

const REFORGE_API_KEY = Deno.env.get("REFORGE_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!REFORGE_API_KEY) {
  console.error("[reforge] REFORGE_API_KEY is not set");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-reforge-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status: number): Response {
  return json({ error: message }, status);
}

function authenticate(req: Request): boolean {
  const key = req.headers.get("x-reforge-key");
  return !!REFORGE_API_KEY && key === REFORGE_API_KEY;
}

// ── Handler: GET /pipeline ────────────────────────────────────────────────────

type DealRow = {
  id: number;
  name: string;
  stage: string;
  amount: number | null;
  currency: string;
  expected_closing_date: string | null;
  archived_at: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  companies: { name: string } | null;
  sales: { first_name: string; last_name: string } | null;
};

type NoteRow = {
  deal_id: number;
  text: string | null;
  date: string;
};

function dealStatus(row: DealRow): string {
  if (row.archived_at) {
    const stage = row.stage ?? "";
    return stage.includes("won") || stage.includes("cerrado_won")
      ? "ganado"
      : "perdido";
  }
  return "activo";
}

async function handlePipeline(): Promise<Response> {
  const { data: deals, error } = await supabase
    .from("deals")
    .select(
      "id, name, stage, amount, currency, expected_closing_date, archived_at, category, created_at, updated_at, companies(name), sales(first_name, last_name)",
    )
    .order("updated_at", { ascending: false });

  if (error) return err(error.message, 500);

  const dealIds = (deals ?? []).map((d: DealRow) => d.id);
  const { data: notes } = await supabase
    .from("deal_notes")
    .select("deal_id, text, date")
    .in("deal_id", dealIds)
    .order("date", { ascending: false });

  const lastNoteByDeal = new Map<number, NoteRow>();
  for (const note of (notes ?? []) as NoteRow[]) {
    if (!lastNoteByDeal.has(note.deal_id)) {
      lastNoteByDeal.set(note.deal_id, note);
    }
  }

  const pipeline = (deals ?? []).map((d: DealRow) => {
    const lastNote = lastNoteByDeal.get(d.id);
    return {
      id: d.id,
      name: d.name,
      company: d.companies?.name ?? null,
      stage: d.stage,
      status: dealStatus(d),
      amount: d.amount ?? null,
      currency: d.currency,
      expected_closing_date: d.expected_closing_date ?? null,
      assignee: d.sales ? `${d.sales.first_name} ${d.sales.last_name}` : null,
      category: d.category ?? null,
      last_activity: lastNote
        ? { date: lastNote.date, text: lastNote.text ?? "" }
        : null,
      created_at: d.created_at,
      updated_at: d.updated_at,
    };
  });

  return json({ data: pipeline, total: pipeline.length });
}

// ── Handler: GET /pipeline/:id ────────────────────────────────────────────────

async function handlePipelineDetail(id: number): Promise<Response> {
  const { data: deal, error } = await supabase
    .from("deals")
    .select(
      "id, name, stage, amount, currency, expected_closing_date, archived_at, category, description, created_at, updated_at, contact_ids, companies(id, name, website), sales(first_name, last_name, email)",
    )
    .eq("id", id)
    .single();

  if (error || !deal) return err("Deal no encontrado", 404);

  const { data: notes } = await supabase
    .from("deal_notes")
    .select("id, text, date, sales(first_name, last_name)")
    .eq("deal_id", id)
    .order("date", { ascending: false })
    .limit(10);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, text, type, due_date, done_date")
    .in(
      "contact_id",
      (deal.contact_ids ?? []).length > 0 ? deal.contact_ids : [0],
    )
    .is("done_date", null)
    .order("due_date", { ascending: true });

  return json({
    data: {
      id: deal.id,
      name: deal.name,
      company: deal.companies ?? null,
      stage: deal.stage,
      status: dealStatus(deal),
      amount: deal.amount ?? null,
      currency: deal.currency,
      expected_closing_date: deal.expected_closing_date ?? null,
      description: deal.description ?? null,
      category: deal.category ?? null,
      assignee: deal.sales
        ? {
            name: `${deal.sales.first_name} ${deal.sales.last_name}`,
            email: deal.sales.email,
          }
        : null,
      notes: (notes ?? []).map((n: Record<string, unknown>) => ({
        id: n.id,
        text: n.text,
        date: n.date,
        author: n.sales
          ? `${(n.sales as Record<string, string>).first_name} ${(n.sales as Record<string, string>).last_name}`
          : null,
      })),
      pending_tasks: tasks ?? [],
      created_at: deal.created_at,
      updated_at: deal.updated_at,
    },
  });
}

// ── Handler: GET /clients ─────────────────────────────────────────────────────

async function handleClients(): Promise<Response> {
  const { data: companies, error } = await supabase
    .from("companies_summary")
    .select("id, name, sector, website, phone_number, nb_deals, nb_contacts")
    .order("name", { ascending: true });

  if (error) return err(error.message, 500);

  return json({ data: companies ?? [], total: (companies ?? []).length });
}

// ── Handler: GET /summary ─────────────────────────────────────────────────────

async function handleSummary(): Promise<Response> {
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  ).toISOString();
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  ).toISOString();

  const [activeRes, wonRes, lostRes, tasksRes] = await Promise.all([
    supabase
      .from("deals")
      .select("id, amount, currency")
      .is("archived_at", null),
    supabase
      .from("deals")
      .select("id, amount, currency")
      .not("archived_at", "is", null)
      .like("stage", "%won%")
      .gte("archived_at", monthStart)
      .lte("archived_at", monthEnd),
    supabase
      .from("deals")
      .select("id")
      .not("archived_at", "is", null)
      .not("stage", "like", "%won%")
      .gte("archived_at", monthStart)
      .lte("archived_at", monthEnd),
    supabase
      .from("tasks")
      .select("id, text, due_date, type, contacts(id, first_name, last_name)")
      .is("done_date", null)
      .lte("due_date", todayEnd)
      .order("due_date", { ascending: true })
      .limit(10),
  ]);

  const activeDeals = activeRes.data ?? [];
  const totalPipelineUSD = activeDeals
    .filter((d: Record<string, unknown>) => d.currency === "USD")
    .reduce(
      (sum: number, d: Record<string, unknown>) =>
        sum + ((d.amount as number) ?? 0),
      0,
    );

  const upcomingTasks = (tasksRes.data ?? []).map(
    (t: Record<string, unknown>) => ({
      id: t.id,
      text: t.text,
      due_date: t.due_date,
      type: t.type,
      contact: t.contacts
        ? `${(t.contacts as Record<string, string>).first_name} ${(t.contacts as Record<string, string>).last_name}`
        : null,
    }),
  );

  return json({
    data: {
      active_deals: activeDeals.length,
      deals_won_this_month: (wonRes.data ?? []).length,
      deals_lost_this_month: (lostRes.data ?? []).length,
      pipeline_value_usd: totalPipelineUSD,
      overdue_and_today_tasks: upcomingTasks.length,
      upcoming_tasks: upcomingTasks,
      generated_at: now.toISOString(),
    },
  });
}

// ── Router ────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!authenticate(req)) {
    return err("Unauthorized", 401);
  }

  if (req.method !== "GET") {
    return err("Method not allowed", 405);
  }

  const url = new URL(req.url);
  // pathname looks like /functions/v1/reforge/pipeline or /functions/v1/reforge/pipeline/42
  const segments = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  // segments: ["functions", "v1", "reforge", ...rest]
  // drop everything up to and including "reforge"
  const reforgeIdx = segments.lastIndexOf("reforge");
  const path = segments.slice(reforgeIdx + 1);

  if (path[0] === "pipeline") {
    const rawId = path[1];
    if (rawId !== undefined) {
      const id = parseInt(rawId, 10);
      if (isNaN(id)) return err("ID de deal inválido", 400);
      return handlePipelineDetail(id);
    }
    return handlePipeline();
  }

  if (path[0] === "clients") return handleClients();
  if (path[0] === "summary") return handleSummary();

  return err("Endpoint no encontrado", 404);
});
