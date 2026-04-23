import { useState, useEffect, useCallback } from "react";
import { useNotify } from "ra-core";
import { getSupabaseClient } from "../providers/supabase/supabase";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface NeonBotSettings {
  id: string;
  kevin_phone: string;
  evolution_instance: string;
  is_active: boolean;
  wa_status: "connected" | "disconnected" | "connecting";
  wa_phone_connected: string | null;
  wa_profile_name: string | null;
}

interface EvolutionInstance {
  connectionStatus: "open" | "close" | "connecting";
  ownerJid?: string;
  profileName?: string;
}

const EVOLUTION_URL =
  (import.meta.env.VITE_EVOLUTION_URL as string) ??
  "https://api.getneonbot.com";
const EVOLUTION_KEY =
  (import.meta.env.VITE_EVOLUTION_API_KEY as string) ??
  "neonbot-master-key-2026";

export const WhatsAppSettings = () => {
  const notify = useNotify();
  const supabase = getSupabaseClient();

  const [settings, setSettings] = useState<NeonBotSettings | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "open" | "close" | "connecting" | null
  >(null);
  const [ownerJid, setOwnerJid] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [kevinPhone, setKevinPhone] = useState("573053812680");
  const [saving, setSaving] = useState(false);
  const [polling, setPolling] = useState(false);

  const loadSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("neonbot_settings")
      .select("*")
      .returns<NeonBotSettings[]>()
      .single();
    if (error) {
      console.error("Settings load error:", error);
      return;
    }
    setSettings(data);
    setKevinPhone(data.kevin_phone ?? "573053812680");
  }, [supabase]);

  const checkEvolutionStatus = useCallback(async () => {
    try {
      const res = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
        headers: { apikey: EVOLUTION_KEY },
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) {
        setConnectionStatus(null);
        return;
      }
      const instances = (await res.json()) as EvolutionInstance[];
      const inst = Array.isArray(instances) ? instances[0] : null;
      if (!inst) {
        setConnectionStatus(null);
        return;
      }

      setConnectionStatus(inst.connectionStatus);
      setOwnerJid(inst.ownerJid?.replace("@s.whatsapp.net", "") ?? null);
      setProfileName(inst.profileName ?? null);

      const waStatus =
        inst.connectionStatus === "open"
          ? "connected"
          : inst.connectionStatus === "connecting"
            ? "connecting"
            : "disconnected";

      if (settings?.id) {
        await supabase
          .from("neonbot_settings")
          .update({
            wa_status: waStatus,
            wa_phone_connected:
              inst.ownerJid?.replace("@s.whatsapp.net", "") ?? null,
            wa_profile_name: inst.profileName ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", settings.id);
      }
    } catch {
      setConnectionStatus(null);
    }
  }, [settings?.id, supabase]);

  const fetchQR = useCallback(async () => {
    setPolling(true);
    try {
      const res = await fetch(
        `${EVOLUTION_URL}/instance/connect/${settings?.evolution_instance ?? "arcano-hub"}`,
        {
          headers: { apikey: EVOLUTION_KEY },
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (!res.ok) {
        setQrBase64(null);
        return;
      }
      const data = (await res.json()) as { base64?: string };
      setQrBase64(data?.base64 ?? null);
    } catch {
      setQrBase64(null);
    } finally {
      setPolling(false);
    }
  }, [settings?.evolution_instance]);

  const saveKevinPhone = async () => {
    const clean = kevinPhone.replace(/[\s+\-()]/g, "");
    if (!clean || clean.length < 8) {
      notify("Número inválido", { type: "error" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("neonbot_settings")
      .update({ kevin_phone: clean, updated_at: new Date().toISOString() })
      .eq("id", settings?.id ?? "");
    setSaving(false);
    if (error) {
      notify("Error al guardar", { type: "error" });
      return;
    }
    notify("Número de Kevin actualizado ✓", { type: "success" });
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
    checkEvolutionStatus();
  }, []);

  useEffect(() => {
    if (connectionStatus !== "open") {
      fetchQR();
      const interval = setInterval(() => {
        checkEvolutionStatus();
        fetchQR();
      }, 30_000);
      return () => clearInterval(interval);
    } else {
      setQrBase64(null);
      const interval = setInterval(checkEvolutionStatus, 60_000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  const isConnected = connectionStatus === "open";

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "680px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 600,
            fontFamily: "Space Grotesk, sans-serif",
            color: "var(--neon-white, #FAFAFA)",
            margin: "0 0 6px",
          }}
        >
          NeonBot — WhatsApp
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--neon-muted, #A0A0A0)",
            margin: 0,
          }}
        >
          Conecta el WhatsApp de la agencia y configura el número de
          notificaciones.
        </p>
      </div>

      {/* Estado de conexión */}
      <div
        style={{
          background: "var(--neon-ink, #111)",
          border: `1px solid ${isConnected ? "rgba(74,222,128,0.3)" : "var(--neon-border, #2E2E2E)"}`,
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              flexShrink: 0,
              background: isConnected
                ? "#4ADE80"
                : connectionStatus === "connecting"
                  ? "#F59E0B"
                  : "#606060",
              boxShadow: isConnected ? "0 0 8px rgba(74,222,128,0.5)" : "none",
            }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--neon-white, #FAFAFA)",
            }}
          >
            {isConnected
              ? `Conectado — ${profileName ?? ""}`
              : connectionStatus === "connecting"
                ? "Conectando..."
                : "Desconectado — escanea el QR"}
          </span>
        </div>

        {isConnected ? (
          <div
            style={{
              background: "var(--neon-surface, #1A1A1A)",
              borderRadius: "8px",
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "var(--neon-muted, #A0A0A0)",
                marginBottom: "4px",
              }}
            >
              Número conectado
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: "JetBrains Mono, monospace",
                color: "#4ADE80",
              }}
            >
              +{ownerJid ?? "—"}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            {qrBase64 ? (
              <>
                <img
                  src={qrBase64}
                  alt="QR WhatsApp"
                  style={{
                    width: "220px",
                    height: "220px",
                    borderRadius: "8px",
                    display: "block",
                    margin: "0 auto 12px",
                  }}
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--neon-muted, #A0A0A0)",
                    margin: "0 0 12px",
                  }}
                >
                  WhatsApp → Dispositivos vinculados → Vincular dispositivo
                </p>
                <p style={{ fontSize: "11px", color: "#606060", margin: 0 }}>
                  El QR se actualiza automáticamente cada 30 segundos
                </p>
              </>
            ) : (
              <div
                style={{ padding: "40px", color: "#606060", fontSize: "13px" }}
              >
                {polling
                  ? "Generando QR..."
                  : "No se pudo obtener el QR — verifica Evolution API"}
              </div>
            )}

            <button
              onClick={() => {
                checkEvolutionStatus();
                fetchQR();
              }}
              disabled={polling}
              style={{
                marginTop: "12px",
                background: "transparent",
                border: "1px solid var(--neon-border, #2E2E2E)",
                borderRadius: "8px",
                color: "var(--neon-muted, #A0A0A0)",
                padding: "8px 16px",
                fontSize: "12px",
                cursor: polling ? "not-allowed" : "pointer",
              }}
            >
              {polling ? "Actualizando..." : "↻ Actualizar QR"}
            </button>
          </div>
        )}
      </div>

      {/* Número de Kevin */}
      <div
        style={{
          background: "var(--neon-ink, #111)",
          border: "1px solid var(--neon-border, #2E2E2E)",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--neon-white, #FAFAFA)",
            margin: "0 0 6px",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          Número de seguimiento
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "var(--neon-muted, #A0A0A0)",
            margin: "0 0 16px",
          }}
        >
          Este número recibe los recordatorios D1/D3/D7 de leads en pipeline.
          Responde 1–5 para actualizar el estado del deal desde WhatsApp.
        </p>

        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 500,
                color: "#606060",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              WhatsApp (con código de país, sin +)
            </label>
            <input
              type="tel"
              value={kevinPhone}
              onChange={(e) => setKevinPhone(e.target.value)}
              placeholder="573053812680"
              style={{
                width: "100%",
                background: "var(--neon-surface, #1A1A1A)",
                border: "1px solid var(--neon-border, #2E2E2E)",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "14px",
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--neon-white, #FAFAFA)",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#F5C518")}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  "var(--neon-border, #2E2E2E)")
              }
            />
          </div>
          <button
            onClick={saveKevinPhone}
            disabled={saving}
            style={{
              background: "#F5C518",
              color: "#0A0A0A",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "DM Sans, sans-serif",
              cursor: saving ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {settings && (
          <p
            style={{
              fontSize: "11px",
              color: "#606060",
              margin: "10px 0 0",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            Activo: +{settings.kevin_phone}
          </p>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSettings;
