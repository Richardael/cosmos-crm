-- ================================================================
-- MIGRACIÓN: Tasks + Contact Status dinámicos
-- Fecha: 2026-04-15
-- ================================================================

-- 1. Tabla de estados de contacto (dinámicos, creados por el usuario)
CREATE TABLE IF NOT EXISTS public.contact_statuses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#9CA3AF',
  icon        TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Solo un status puede ser default por tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_statuses_default
  ON public.contact_statuses(tenant_id)
  WHERE is_default = TRUE;

-- 2. Agregar columna status_id a contacts (si no existe)
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS contact_status_id UUID REFERENCES public.contact_statuses(id);

-- 3. RLS para contact_statuses
ALTER TABLE public.contact_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_statuses FORCE ROW LEVEL SECURITY;

CREATE POLICY "contact_statuses_select" ON public.contact_statuses
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "contact_statuses_insert" ON public.contact_statuses
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "contact_statuses_update" ON public.contact_statuses
  FOR UPDATE USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "contact_statuses_delete" ON public.contact_statuses
  FOR DELETE USING (
    tenant_id = public.get_current_tenant_id()
    AND is_default = FALSE
  );

-- 4. Índices para contact_statuses
CREATE INDEX IF NOT EXISTS idx_contact_statuses_tenant
  ON public.contact_statuses(tenant_id, position);

CREATE INDEX IF NOT EXISTS idx_contacts_status
  ON public.contacts(contact_status_id);

-- 5. Índices para tasks (si no existen ya)
-- NOTA: tasks no tiene tenant_id (instalación single-tenant)
CREATE INDEX IF NOT EXISTS idx_tasks_due_date
  ON public.tasks(due_date) WHERE due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_contact_id
  ON public.tasks(contact_id);

-- 6. Seed: estados por defecto para el tenant arcano-hub
INSERT INTO public.contact_statuses (tenant_id, label, color, icon, position, is_default)
SELECT
  t.id,
  s.label,
  s.color,
  s.icon,
  s.position,
  s.is_default
FROM public.tenants t
CROSS JOIN (VALUES
  ('Nuevo',          '#60A5FA', '🆕', 0, TRUE),
  ('Activo',         '#00C48E', '✅', 1, FALSE),
  ('En seguimiento', '#FCD34D', '🔄', 2, FALSE),
  ('Inactivo',       '#9CA3AF', '😴', 3, FALSE),
  ('Cliente',        '#A78BFA', '⭐', 4, FALSE)
) AS s(label, color, icon, position, is_default)
WHERE t.slug = 'arcano-hub'
ON CONFLICT DO NOTHING;
