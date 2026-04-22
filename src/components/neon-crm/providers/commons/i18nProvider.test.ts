import { describe, expect, it } from "vitest";
import { i18nProvider } from "./i18nProvider";

describe("i18nProvider", () => {
  it("registers only the es locale", () => {
    expect(i18nProvider.getLocales?.()).toEqual([
      { locale: "es", name: "Español" },
    ]);
  });

  it("uses es as the default locale", () => {
    expect(i18nProvider.getLocale()).toBe("es");
  });

  it("translates CRM keys to Spanish", () => {
    expect(i18nProvider.translate("crm.language")).toBe("Idioma");
  });

  it("translates resource names to Spanish", () => {
    expect(
      i18nProvider.translate("resources.contacts.name", { smart_count: 2 }),
    ).toBe("Contactos");
  });

  it("translates ra-supabase auth keys to Spanish", () => {
    expect(i18nProvider.translate("ra-supabase.auth.forgot_password")).toBe(
      "¿Olvidaste tu contraseña?",
    );
  });

  it("translates deal resource keys to Spanish", () => {
    expect(i18nProvider.translate("resources.deals.empty.title")).toBe(
      "No se encontraron deals",
    );
  });

  it("translates ra core action keys to Spanish", () => {
    expect(i18nProvider.translate("ra.action.save")).toBe("Guardar");
    expect(i18nProvider.translate("ra.action.delete")).toBe("Eliminar");
    expect(i18nProvider.translate("ra.action.cancel")).toBe("Cancelar");
  });
});
