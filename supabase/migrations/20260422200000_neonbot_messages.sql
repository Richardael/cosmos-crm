-- ================================================================
-- NeonBot: logs WhatsApp + scheduler deduplication
-- ================================================================

-- 1. Tabla principal de mensajes WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id           bigint REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id              bigint REFERENCES public.deals(id)    ON DELETE SET NULL,

  direction            TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  message_type         TEXT NOT NULL CHECK (message_type IN (
    'welcome', 'scheduler_d1', 'scheduler_d3', 'scheduler_d7',
    'kevin_command', 'kevin_reply'
  )),

  phone_number         TEXT NOT NULL,
  message_text         TEXT NOT NULL,

  status               TEXT NOT NULL DEFAULT 'sent'
                       CHECK (status IN ('sent', 'failed', 'delivered', 'read')),

  evolution_message_id TEXT,
  stage_before         TEXT,
  stage_after          TEXT,

  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wam_contact_id   ON public.whatsapp_messages (contact_id);
CREATE INDEX IF NOT EXISTS idx_wam_deal_id      ON public.whatsapp_messages (deal_id);
CREATE INDEX IF NOT EXISTS idx_wam_created_at   ON public.whatsapp_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wam_message_type ON public.whatsapp_messages (message_type);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "whatsapp_messages_authenticated"
  ON public.whatsapp_messages FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 2. Deduplicación de notificaciones del scheduler
CREATE TABLE IF NOT EXISTS public.kevin_notifications (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id   bigint NOT NULL,
  day_type  int NOT NULL CHECK (day_type IN (1, 3, 7)),
  sent_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (deal_id, day_type)
);

ALTER TABLE public.kevin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kevin_notifications_service"
  ON public.kevin_notifications FOR ALL TO service_role USING (true);

CREATE POLICY "kevin_notifications_authenticated"
  ON public.kevin_notifications FOR SELECT TO authenticated USING (true);

-- 3. Función SQL para el scheduler
CREATE OR REPLACE FUNCTION public.get_kevin_followups()
RETURNS TABLE (
  contact_id         bigint,
  first_name         text,
  last_name          text,
  email              text,
  phone              text,
  deal_id            bigint,
  deal_name          text,
  deal_description   text,
  deal_amount        numeric,
  days_since_created int
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    c.id,
    c.first_name,
    COALESCE(c.last_name, ''),
    COALESCE(c.email_jsonb->0->>'email', 'No indicado'),
    COALESCE(c.phone_jsonb->0->>'number', ''),
    d.id,
    d.name,
    COALESCE(d.description, ''),
    COALESCE(d.amount, 0)::numeric,
    EXTRACT(DAY FROM NOW() - c.first_seen)::int
  FROM contacts c
  JOIN deals d ON d.contact_ids @> ARRAY[c.id]
  WHERE
    d.stage = 'prospecto'
    AND d.archived_at IS NULL
    AND c.first_seen IS NOT NULL
    AND EXTRACT(DAY FROM NOW() - c.first_seen)::int IN (1, 3, 7)
  ORDER BY c.first_seen ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_kevin_followups() TO service_role;
