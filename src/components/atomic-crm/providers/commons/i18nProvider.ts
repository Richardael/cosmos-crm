import { mergeTranslations } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import spanishMessages from "@blackbox-vision/ra-language-spanish";
import { raSupabaseEnglishMessages } from "ra-supabase-language-english";
import { spanishCrmMessages } from "./spanishCrmMessages";

// Build the Spanish catalog:
// 1. Start with the base English catalog (needed for ra-supabase baseline)
// 2. Layer Spanish base messages on top
// 3. Layer Spanish supabase + CRM messages (includes supabase auth overrides)
const spanishCatalog = mergeTranslations(
  raSupabaseEnglishMessages, // baseline for ra-supabase keys
  spanishMessages, // react-admin core in Spanish
  spanishCrmMessages, // CRM strings + supabase auth in Spanish
);

export const i18nProvider = polyglotI18nProvider(
  () => spanishCatalog,
  "es",
  [{ locale: "es", name: "Español" }],
  { allowMissing: true },
);

// Used by tests — keeps English so test assertions don't break
import englishMessages from "ra-language-english";
import { englishCrmMessages } from "./englishCrmMessages";

const englishCatalog = mergeTranslations(
  raSupabaseEnglishMessages,
  englishMessages,
  englishCrmMessages,
);

export const testI18nProvider = polyglotI18nProvider(
  () => englishCatalog,
  "en",
  [{ locale: "en", name: "English" }],
  { allowMissing: true },
);
