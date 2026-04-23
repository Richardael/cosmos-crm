-- ================================================================
-- NeonBot Settings: configuración de WhatsApp por tenant/admin
-- ================================================================

CREATE TABLE IF NOT EXISTS public.neonbot_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kevin_phone         TEXT NOT NULL DEFAULT '573053812680',
  evolution_instance  TEXT NOT NULL DEFAULT 'arcano-hub',
  is_active           BOOLEAN NOT NULL DEFAULT true,
  wa_status           TEXT NOT NULL DEFAULT 'disconnected'
                      CHECK (wa_status IN ('connected','disconnected','connecting')),
  wa_phone_connected  TEXT,
  wa_profile_name     TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Singleton: solo 1 fila
CREATE UNIQUE INDEX IF NOT EXISTS neonbot_settings_singleton
  ON public.neonbot_settings ((true));

ALTER TABLE public.neonbot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "neonbot_settings_authenticated"
  ON public.neonbot_settings FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.neonbot_settings (kevin_phone, evolution_instance, is_active, wa_status)
VALUES ('573053812680', 'arcano-hub', true, 'disconnected')
ON CONFLICT DO NOTHING;
