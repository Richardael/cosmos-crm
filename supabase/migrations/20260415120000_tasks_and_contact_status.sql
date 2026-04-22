-- ================================================================
-- MIGRACIÓN: Contact Status dinámicos — v2 sin dependencia de tenants
-- Fecha: 2026-04-15
-- ================================================================

-- 1. Tabla de estados de contacto (single-tenant, sin tenant_id)
CREATE TABLE IF NOT EXISTS public.contact_statuses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#9CA3AF',
  icon        TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Un único status default a la vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_statuses_default
  ON public.contact_statuses (is_default)
  WHERE is_default = TRUE;

-- Índice para ordenamiento
CREATE INDEX IF NOT EXISTS idx_contact_statuses_position
  ON public.contact_statuses (position);

-- 2. RLS — acceso completo para usuarios autenticados (single-tenant)
ALTER TABLE public.contact_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_statuses_all_authenticated"
  ON public.contact_statuses FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 3. Columna en contacts
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS contact_status_id UUID
    REFERENCES public.contact_statuses (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_status
  ON public.contacts (contact_status_id);

-- 4. Índices en tasks (tabla ya existe de migración anterior)
CREATE INDEX IF NOT EXISTS idx_tasks_due_date
  ON public.tasks (due_date) WHERE due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_contact_id
  ON public.tasks (contact_id);

-- 5. Seed: estados por defecto
INSERT INTO public.contact_statuses (label, color, icon, position, is_default)
VALUES
  ('Nuevo',           '#60A5FA', '🆕', 0, TRUE),
  ('Activo',          '#22C55E', '✅', 1, FALSE),
  ('En seguimiento',  '#FCD34D', '🔄', 2, FALSE),
  ('Inactivo',        '#9CA3AF', '😴', 3, FALSE),
  ('Cliente',         '#F5C518', '⭐', 4, FALSE)
ON CONFLICT DO NOTHING;
