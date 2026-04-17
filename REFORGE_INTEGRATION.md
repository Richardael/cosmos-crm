# Reforge Integration — CosmosCRM

Documentación de la API de lectura que expone CosmosCRM para el agente **Artoria**
(bot de Telegram de Arcano Hub, sistema ReForge).

---

## Arquitectura

CosmosCRM es un SPA (Vite + React) sin servidor backend propio.
Toda la lógica de datos vive en **Supabase** (PostgreSQL + PostgREST).

La integración con ReForge usa una **Supabase Edge Function** (runtime Deno)
desplegada en `/functions/v1/reforge`. La función usa la _service role key_
de Supabase para consultas directas, sin depender del usuario autenticado.

```
Artoria → HTTPS → Supabase Edge Function (reforge) → PostgreSQL
```

---

## Configuración inicial

### 1. Variable de entorno obligatoria

Configura el secreto en tu proyecto Supabase:

```bash
supabase secrets set REFORGE_API_KEY="tu_clave_secreta_aqui"
```

> Genera una clave segura: `openssl rand -hex 32`

### 2. Desplegar la función

```bash
supabase functions deploy reforge --no-verify-jwt
```

El flag `--no-verify-jwt` es necesario porque la función usa su propia
autenticación (`X-Reforge-Key`) en lugar del JWT de Supabase.

---

## Base URL

```
https://{PROJECT_REF}.supabase.co/functions/v1/reforge
```

**Local (desarrollo):**

```
http://localhost:54321/functions/v1/reforge
```

---

## Autenticación

Todas las peticiones deben incluir el header:

```
X-Reforge-Key: {REFORGE_API_KEY}
```

| Código | Descripción                      |
|--------|----------------------------------|
| `401`  | Key ausente o incorrecta         |
| `405`  | Método no permitido (solo GET)   |
| `404`  | Endpoint no encontrado           |
| `500`  | Error interno de base de datos   |

---

## Endpoints

### `GET /pipeline`

Lista todos los deals del CRM, activos y archivados.

**Ejemplo de request (curl):**

```bash
curl -H "X-Reforge-Key: tu_clave" \
  https://{PROJECT_REF}.supabase.co/functions/v1/reforge/pipeline
```

**Ejemplo de respuesta:**

```json
{
  "total": 2,
  "data": [
    {
      "id": 42,
      "name": "Landing Page — Café Caracas",
      "company": "Café Caracas C.A.",
      "stage": "propuesta",
      "status": "activo",
      "amount": 800,
      "currency": "USD",
      "expected_closing_date": "2026-05-15T00:00:00+00:00",
      "assignee": "Kevin Pérez",
      "category": "landing_page",
      "last_activity": {
        "date": "2026-04-10T14:32:00+00:00",
        "text": "Enviamos propuesta actualizada. Cliente revisará esta semana."
      },
      "created_at": "2026-03-01T10:00:00+00:00",
      "updated_at": "2026-04-10T14:32:00+00:00"
    },
    {
      "id": 31,
      "name": "AREPay — Módulo pagos",
      "company": "Fintech Andina S.A.",
      "stage": "cerrado_won",
      "status": "ganado",
      "amount": 2400,
      "currency": "USD",
      "expected_closing_date": "2026-03-31T00:00:00+00:00",
      "assignee": "Kevin Pérez",
      "category": "arepay",
      "last_activity": {
        "date": "2026-04-01T09:00:00+00:00",
        "text": "Contrato firmado. Inicio de proyecto el 5 de abril."
      },
      "created_at": "2026-02-10T08:00:00+00:00",
      "updated_at": "2026-04-01T09:00:00+00:00"
    }
  ]
}
```

**Campos del deal:**

| Campo                    | Tipo              | Descripción                                      |
|--------------------------|-------------------|--------------------------------------------------|
| `id`                     | `number`          | ID único del deal                                |
| `name`                   | `string`          | Nombre del deal                                  |
| `company`                | `string \| null`  | Nombre de la empresa cliente                     |
| `stage`                  | `string`          | Etapa actual (ver valores abajo)                 |
| `status`                 | `string`          | `"activo"` \| `"ganado"` \| `"perdido"`         |
| `amount`                 | `number \| null`  | Valor monetario del deal                         |
| `currency`               | `string`          | Moneda: `"USD"` \| `"VES"` \| `"USDT"`         |
| `expected_closing_date`  | `string \| null`  | ISO 8601 — fecha de cierre esperada             |
| `assignee`               | `string \| null`  | Nombre completo del responsable                  |
| `category`               | `string \| null`  | Tipo de servicio (ver valores abajo)             |
| `last_activity`          | `object \| null`  | `{ date, text }` — última nota del deal          |
| `created_at`             | `string`          | ISO 8601                                         |
| `updated_at`             | `string`          | ISO 8601                                         |

**Etapas del pipeline (`stage`):**

```
prospecto → contactado → reunion → propuesta → negociacion → cerrado_won | cerrado_lost
```

**Categorías de servicio (`category`):**

```
arepay | cosmos_crm | landing_page | webapp | consultoria | banco_horas
```

---

### `GET /pipeline/:id`

Detalle completo de un deal específico, incluyendo notas recientes y tareas pendientes.

**Ejemplo:**

```bash
curl -H "X-Reforge-Key: tu_clave" \
  https://{PROJECT_REF}.supabase.co/functions/v1/reforge/pipeline/42
```

**Ejemplo de respuesta:**

```json
{
  "data": {
    "id": 42,
    "name": "Landing Page — Café Caracas",
    "company": {
      "id": 7,
      "name": "Café Caracas C.A.",
      "website": "https://cafecaracas.com"
    },
    "stage": "propuesta",
    "status": "activo",
    "amount": 800,
    "currency": "USD",
    "expected_closing_date": "2026-05-15T00:00:00+00:00",
    "description": "Landing page de producto para nueva línea de café gourmet.",
    "category": "landing_page",
    "assignee": {
      "name": "Kevin Pérez",
      "email": "kevin@arcanohub.com"
    },
    "notes": [
      {
        "id": 201,
        "text": "Enviamos propuesta actualizada. Cliente revisará esta semana.",
        "date": "2026-04-10T14:32:00+00:00",
        "author": "Kevin Pérez"
      }
    ],
    "pending_tasks": [
      {
        "id": 88,
        "text": "Llamar al cliente para confirmar presupuesto",
        "type": "llamada",
        "due_date": "2026-04-18T10:00:00+00:00",
        "done_date": null
      }
    ],
    "created_at": "2026-03-01T10:00:00+00:00",
    "updated_at": "2026-04-10T14:32:00+00:00"
  }
}
```

> `notes`: máximo últimas 10 notas, orden descendente por fecha.
> `pending_tasks`: tareas sin `done_date`, de contactos vinculados al deal.

---

### `GET /clients`

Lista todas las empresas/clientes del CRM.

**Ejemplo:**

```bash
curl -H "X-Reforge-Key: tu_clave" \
  https://{PROJECT_REF}.supabase.co/functions/v1/reforge/clients
```

**Ejemplo de respuesta:**

```json
{
  "total": 3,
  "data": [
    {
      "id": 7,
      "name": "Café Caracas C.A.",
      "sector": "retail",
      "website": "https://cafecaracas.com",
      "phone_number": "+58 412 555 0001",
      "nb_deals": 2,
      "nb_contacts": 3
    },
    {
      "id": 12,
      "name": "Fintech Andina S.A.",
      "sector": "fintech",
      "website": "https://fintechandina.com",
      "phone_number": null,
      "nb_deals": 1,
      "nb_contacts": 1
    }
  ]
}
```

> `nb_deals` y `nb_contacts` incluyen deals archivados (histórico total).

---

### `GET /summary`

Resumen ejecutivo del estado actual del CRM.

**Ejemplo:**

```bash
curl -H "X-Reforge-Key: tu_clave" \
  https://{PROJECT_REF}.supabase.co/functions/v1/reforge/summary
```

**Ejemplo de respuesta:**

```json
{
  "data": {
    "active_deals": 8,
    "deals_won_this_month": 2,
    "deals_lost_this_month": 1,
    "pipeline_value_usd": 12400,
    "overdue_and_today_tasks": 3,
    "upcoming_tasks": [
      {
        "id": 88,
        "text": "Llamar al cliente para confirmar presupuesto",
        "due_date": "2026-04-16T10:00:00+00:00",
        "type": "llamada",
        "contact": "María García"
      },
      {
        "id": 91,
        "text": "Enviar propuesta revisada",
        "due_date": "2026-04-16T15:00:00+00:00",
        "type": "email",
        "contact": "Juan Rodríguez"
      }
    ],
    "generated_at": "2026-04-16T12:00:00.000Z"
  }
}
```

**Campos:**

| Campo                    | Descripción                                               |
|--------------------------|-----------------------------------------------------------|
| `active_deals`           | Deals sin `archived_at` (activos en este momento)         |
| `deals_won_this_month`   | Deals cerrados como ganados en el mes calendario actual   |
| `deals_lost_this_month`  | Deals cerrados como perdidos en el mes calendario actual  |
| `pipeline_value_usd`     | Suma de `amount` de deals activos en USD                  |
| `overdue_and_today_tasks`| Cantidad de tareas vencidas o con vencimiento hoy         |
| `upcoming_tasks`         | Hasta 10 tareas vencidas o que vencen hoy                 |
| `generated_at`           | Timestamp ISO 8601 del momento en que se generó           |

---

## Notas para el consumidor (Artoria)

### Formato de fechas
Todas las fechas siguen **ISO 8601** con timezone: `2026-04-16T10:00:00+00:00`.

### Paginación
Los endpoints actuales no paginan — devuelven todos los registros.
El volumen esperado para Arcano Hub es bajo (< 100 deals, < 50 empresas).

### Rate limit
Supabase Edge Functions no impone rate limit propio. El límite viene del
plan de Supabase (invocaciones/mes). Para Artoria, 1 consulta por mensaje
de usuario es más que suficiente dentro del Free/Pro tier.

### Valores nulos
Campos opcionales pueden ser `null`. Artoria debe manejar gracefully:
`company`, `amount`, `expected_closing_date`, `last_activity`, `assignee`.

### Monedas mixtas
`pipeline_value_usd` solo suma deals en USD. Si hay deals en VES o USDT,
estos aparecen en el detalle de cada deal pero no en el total del summary.

### Deals ganados/perdidos
Un deal archivado con `stage` que contenga `"won"` o `"cerrado_won"` es
`"ganado"`. Cualquier otro deal archivado es `"perdido"`.

---

## Ejemplo de uso desde Python (Artoria/ReForge)

```python
import httpx

REFORGE_BASE = "https://{PROJECT_REF}.supabase.co/functions/v1/reforge"
REFORGE_KEY = "tu_clave_secreta"
HEADERS = {"X-Reforge-Key": REFORGE_KEY}

def get_summary():
    r = httpx.get(f"{REFORGE_BASE}/summary", headers=HEADERS, timeout=10)
    r.raise_for_status()
    return r.json()["data"]

def get_pipeline():
    r = httpx.get(f"{REFORGE_BASE}/pipeline", headers=HEADERS, timeout=10)
    r.raise_for_status()
    return r.json()["data"]

def get_deal(deal_id: int):
    r = httpx.get(f"{REFORGE_BASE}/pipeline/{deal_id}", headers=HEADERS, timeout=10)
    r.raise_for_status()
    return r.json()["data"]

def get_clients():
    r = httpx.get(f"{REFORGE_BASE}/clients", headers=HEADERS, timeout=10)
    r.raise_for_status()
    return r.json()["data"]
```

---

## Checklist de despliegue

- [ ] Generar `REFORGE_API_KEY` segura: `openssl rand -hex 32`
- [ ] `supabase secrets set REFORGE_API_KEY="..."`
- [ ] `supabase functions deploy reforge --no-verify-jwt`
- [ ] Verificar con `curl -H "X-Reforge-Key: ..." {URL}/summary`
- [ ] Compartir `REFORGE_API_KEY` con el equipo de ReForge de forma segura (nunca por chat plano)
- [ ] Agregar `REFORGE_API_KEY` al gestor de secretos de ReForge/Artoria

---

*CosmosCRM — Arcano Hub · Integración ReForge v1 · Abril 2026*
