# Schema Audit — Neon CRM
> Generado: 2026-04-21

## Tablas confirmadas en migraciones

| Tabla | Columnas clave | RLS activo | tenant_id |
|-------|---------------|------------|-----------|
| `contacts` | id, first_name, last_name, email_jsonb, phone_jsonb, background, source, status, tags, company_id, sales_id, linkedin_url, contact_status_id | ✅ | ❌ |
| `deals` | id, name, contact_ids (bigint[]), stage, amount, currency, category, description, company_id, sales_id, expected_closing_date | ✅ | ❌ |
| `contact_notes` | id, contact_id, text, date, sales_id, status, attachments | ✅ | ❌ |
| `tasks` | id, contact_id, type, text, due_date, done_date, sales_id | ✅ | ❌ |
| `companies` | id, name, sector, size, website, phone_number, sales_id, state_abbr, ... | ✅ | ❌ |
| `sales` | id, first_name, last_name, email, administrator, user_id, disabled | ✅ | ❌ |
| `tags` | id, name, color | ✅ | ❌ |
| `contact_statuses` | id, tenant_id, label, color, icon, position, is_default | ✅ | ✅ |
| `configuration` | id (singleton=1), config (jsonb) | ✅ | ❌ |

## Estado de tenants

- ✅ Tabla `tenants` existe (referenciada por `contact_statuses.tenant_id`)
- ❌ Tabla `tenant_users` no confirmada en migraciones
- ❌ `tenant_id` en tabla `contacts` — NO existe
- ❌ `tenant_id` en tabla `deals` — NO existe
- ✅ Función `get_current_tenant_id()` existe (usada en RLS de contact_statuses)
- Instalación: **single-tenant** para contacts/deals/notes, multi-tenant solo para contact_statuses

## Columnas exactas de `contacts`

```sql
id                bigint  PK  auto
first_name        text    nullable
last_name         text    nullable
gender            text    nullable
title             text    nullable
email_jsonb       jsonb   nullable  -- formato: [{"email":"...","type":"Other"}]
phone_jsonb       jsonb   nullable  -- formato: [{"number":"...","type":"Other"}]
background        text    nullable
has_newsletter    boolean nullable
status            text    nullable
tags              bigint[] nullable
company_id        bigint  nullable  FK→companies
sales_id          bigint  nullable  FK→sales
linkedin_url      text    nullable
first_seen        timestamptz nullable
last_seen         timestamptz nullable
avatar            jsonb   nullable
source            text    nullable  -- Arcano Hub: instagram/linkedin/web/whatsapp/etc
contact_status_id uuid    nullable  FK→contact_statuses
```

**IMPORTANTE:** `email` fue ELIMINADO — usar `email_jsonb`.
**IMPORTANTE:** `phone_1_number`/`phone_1_type` fueron ELIMINADOS — usar `phone_jsonb`.

## Columnas exactas de `deals`

```sql
id                     bigint  PK  auto
name                   text    NOT NULL
company_id             bigint  nullable  FK→companies
contact_ids            bigint[] nullable  -- array de contact IDs
category               text    nullable
stage                  text    NOT NULL   -- 'prospecto'|'contactado'|'reunion'|...
description            text    nullable
amount                 bigint  nullable
created_at             timestamptz NOT NULL default now()
updated_at             timestamptz NOT NULL default now()
archived_at            timestamptz nullable
expected_closing_date  text    nullable   -- date-only string desde migración
sales_id               bigint  nullable  FK→sales
index                  smallint nullable
currency               text    NOT NULL default 'USD'
```

## Columnas exactas de `contact_notes`

```sql
id          bigint  PK  auto
contact_id  bigint  NOT NULL  FK→contacts
text        text    nullable
date        timestamptz default now()
sales_id    bigint  nullable  FK→sales
status      text    nullable
attachments jsonb[] nullable
```

## Veredicto para Lead Capture

**ESCENARIO A — Single-tenant, sin tenant_id en contacts/deals.**

El insert de la Edge Function es directo:

```typescript
// contacts insert
{
  first_name: "...",
  last_name: "...",
  email_jsonb: [{ email: "...", type: "Other" }],  // si es email
  phone_jsonb: [{ number: "...", type: "Other" }],  // si es WhatsApp
  source: "web" | "whatsapp",
  background: "Lead desde arcanohub.com — ...",
}

// deals insert
{
  name: "Nombre — servicio1, servicio2",
  contact_ids: [contactId],  // bigint[]
  stage: "prospecto",
  amount: 1000,  // bigint
  currency: "USD",
  description: "...",
}

// contact_notes insert
{
  contact_id: contactId,
  text: "📋 Lead desde arcanohub.com\n...",
}
```

No se necesita `ARCANO_HUB_TENANT_ID` para el lead capture.
