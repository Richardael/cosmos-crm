import type { ConfigurationContextValue } from "./ConfigurationContext";

export const defaultDarkModeLogo = "./logos/cosmos-crm-logo.svg";
export const defaultLightModeLogo = "./logos/cosmos-crm-logo.svg";

export const defaultCurrency = "USD";

export const defaultTitle = "CosmosCRM";

// ─── Arcano Hub: deal pipeline stages ──────────────────────────────────────
export const defaultDealStages = [
  { value: "prospecto", label: "Prospecto", color: "#9CA3AF", probability: 10 },
  {
    value: "contactado",
    label: "Contactado",
    color: "#60A5FA",
    probability: 25,
  },
  { value: "reunion", label: "En Reunión", color: "#A78BFA", probability: 40 },
  { value: "propuesta", label: "Propuesta", color: "#FCD34D", probability: 60 },
  {
    value: "negociacion",
    label: "Negociación",
    color: "#FB923C",
    probability: 75,
  },
  {
    value: "cerrado_won",
    label: "✅ Cerrado Won",
    color: "#00C48E",
    probability: 100,
  },
  {
    value: "cerrado_lost",
    label: "❌ Cerrado Lost",
    color: "#EF4444",
    probability: 0,
  },
];

// Stages excluded from the active Kanban board (terminal states)
export const defaultDealPipelineStatuses = ["cerrado_won", "cerrado_lost"];

// ─── Arcano Hub: service types (replaces generic deal categories) ───────────
export const defaultDealCategories = [
  { value: "arepay", label: "🍽️ ArePay" },
  { value: "cosmos_crm", label: "🌌 CosmosCRM" },
  { value: "landing_page", label: "🚀 Landing Page" },
  { value: "webapp", label: "💻 Web App a Medida" },
  { value: "consultoria", label: "🧠 Consultoría Tech" },
  { value: "banco_horas", label: "⏱️ Banco de Horas" },
  { value: "otro", label: "📦 Otro" },
];

// ─── Arcano Hub: contact acquisition sources ───────────────────────────────
export const contactSources = [
  { value: "instagram", label: "📸 Instagram" },
  { value: "linkedin", label: "💼 LinkedIn" },
  { value: "referido", label: "🤝 Referido" },
  { value: "whatsapp", label: "💬 WhatsApp Directo" },
  { value: "web", label: "🌐 Web / Landing" },
  { value: "evento", label: "🎯 Evento / Demo" },
  { value: "coldoutreach", label: "📧 Cold Outreach" },
];

// ─── Arcano Hub: deal currencies (Venezuela multi-currency) ────────────────
export const dealCurrencies = [
  { value: "USD", label: "USD — Dólar" },
  { value: "USDT", label: "USDT — Tether" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "VES", label: "VES — Bolívar" },
  { value: "COP", label: "COP — Peso colombiano" },
];

export const defaultCompanySectors = [
  { value: "communication-services", label: "Communication Services" },
  { value: "consumer-discretionary", label: "Consumer Discretionary" },
  { value: "consumer-staples", label: "Consumer Staples" },
  { value: "energy", label: "Energy" },
  { value: "financials", label: "Financials" },
  { value: "health-care", label: "Health Care" },
  { value: "industrials", label: "Industrials" },
  { value: "information-technology", label: "Information Technology" },
  { value: "materials", label: "Materials" },
  { value: "real-estate", label: "Real Estate" },
  { value: "utilities", label: "Utilities" },
];

export const defaultNoteStatuses = [
  { value: "cold", label: "Cold", color: "#7dbde8" },
  { value: "warm", label: "Warm", color: "#e8cb7d" },
  { value: "hot", label: "Hot", color: "#e88b7d" },
  { value: "in-contract", label: "In Contract", color: "#a4e87d" },
];

export const defaultTaskTypes = [
  { value: "none", label: "None" },
  { value: "email", label: "Email" },
  { value: "demo", label: "Demo" },
  { value: "lunch", label: "Lunch" },
  { value: "meeting", label: "Meeting" },
  { value: "follow-up", label: "Follow-up" },
  { value: "thank-you", label: "Thank you" },
  { value: "ship", label: "Ship" },
  { value: "call", label: "Call" },
];

export const defaultConfiguration: ConfigurationContextValue = {
  companySectors: defaultCompanySectors,
  currency: defaultCurrency,
  dealCategories: defaultDealCategories,
  dealPipelineStatuses: defaultDealPipelineStatuses,
  dealStages: defaultDealStages,
  noteStatuses: defaultNoteStatuses,
  taskTypes: defaultTaskTypes,
  title: defaultTitle,
  darkModeLogo: defaultDarkModeLogo,
  lightModeLogo: defaultLightModeLogo,
};
