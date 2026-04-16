# 🌌 CLAUDE.md — CosmosCRM
> Guía de proyecto para Claude Code. Lee este archivo completo antes de tocar cualquier cosa.

---

## ¿Qué es este proyecto?

**CosmosCRM** es el CRM interno y SaaS de [Arcano Hub](https://arcanohub.com), construido
como fork de [Atomic CRM](https://github.com/marmelab/atomic-crm) (MIT License).

- **Uso interno actual:** Kevin (co-fundador, ventas) gestiona prospectos y deals de Arcano Hub
- **Uso futuro:** SaaS multi-tenant para clientes externos bajo `{slug}.cosmoscrm.io`
- **Stack base:** Vite + React + TypeScript + react-admin + shadcn/ui + Supabase
- **Repo original:** `github.com/marmelab/atomic-crm` — mantener compatibilidad con upstream cuando sea posible

---

## Stack Técnico

```yaml
Runtime:      Node.js 20+
Bundler:      Vite
Framework:    React 18
Language:     TypeScript — STRICT. Zero `any`. Zero `@ts-ignore`.
UI Layer:     react-admin (data grid, forms, routing)
Components:   shadcn/ui + Radix UI primitives
Styling:      TailwindCSS (utility-first) + CSS Variables
Auth:         Supabase Auth (email/password)
Database:     Supabase (PostgreSQL) con RLS obligatorio
i18n:         ra-i18n-polyglot + @blackbox-vision/ra-language-spanish
Charts:       recharts
```

---

## Design System — Arcano Hub

```css
/* Paleta — NUNCA usar colores hardcodeados fuera de estas variables */
--void:    #1A1E29   /* Fondo primario */
--deep:    #132D48   /* Fondo secundario / secciones alternas */
--emerald: #00C48E   /* Acento principal · CTAs · highlights */
--ghost:   #EBEBEB   /* Texto principal sobre fondos oscuros */
--surface: #232837   /* Cards y superficies elevadas */
--border:  #2E3547   /* Bordes sutiles */
--ghost-muted: #9CA3AF /* Texto secundario / placeholders */
```

```
Tipografía Display: Bebas Neue / Akira Expanded (headings grandes)
Tipografía Body/UI: DM Sans / Avenir Next
Modo:              DARK ONLY — sin toggle light/dark
```

---

## Estructura del Proyecto

```
cosmos-crm/
├── src/
│   ├── components/        # Componentes reutilizables (NO react-admin específicos)
│   │   ├── ui/            # shadcn/ui components
│   │   └── crm/           # Componentes específicos de CosmosCRM
│   ├── i18n/
│   │   ├── i18nProvider.ts # Provider principal — español solamente
│   │   └── es.ts           # Traducciones: resources + campos + strings propios
│   ├── resources/         # Definiciones react-admin por entidad
│   │   ├── contacts/
│   │   ├── deals/
│   │   ├── companies/
│   │   ├── tasks/
│   │   ├── activities/
│   │   └── notes/
│   ├── dashboard/         # Vista principal de Kevin
│   ├── hooks/             # Custom hooks reutilizables
│   ├── providers/         # dataProvider, authProvider, TenantProvider
│   ├── types/             # Tipos TypeScript globales
│   └── App.tsx            # Root — Admin de react-admin
├── supabase/
│   ├── migrations/        # SQL migrations en orden cronológico
│   └── seed.sql           # Datos iniciales (tenant arcano-hub, usuario admin)
├── public/
├── CLAUDE.md              # Este archivo
├── SECURITY.md            # Políticas de seguridad
└── .env.example           # Variables requeridas (sin valores reales)
```

---

## Reglas de Código — NO NEGOCIABLES

### TypeScript
```typescript
// ✅ Correcto
const getContact = async (id: string): Promise<Contact> => { ... }

// ❌ Prohibido
const getContact = async (id: any) => { ... }
const result: any = await supabase.from('contacts').select()
```

### Componentes React
- **Máximo 200 líneas por componente.** Si crece → refactorizar en subcomponentes
- **Naming:** PascalCase para componentes, camelCase para hooks y utils
- `'use client'` solo si hay estado local o event handlers — no por default
- Toda lista necesita un **empty state** diseñado (no dejar vacío)
- Loading states: **skeleton shimmer** — nunca spinners solos
- Errores: **toast con mensaje útil** — nunca "Error" genérico

### Supabase / Base de Datos
```typescript
// ✅ Siempre tipar el resultado
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .returns<Contact[]>()

// ❌ Nunca consultar sin tipo
const { data } = await supabase.from('contacts').select()
```

- **RLS SIEMPRE activo** en todas las tablas con datos de negocio
- **tenant_id** en toda tabla multi-tenant — extraído del JWT, nunca del body
- Las migraciones van en `supabase/migrations/` con nombre `YYYYMMDDHHMMSS_descripcion.sql`

### Formularios
```typescript
// Siempre: react-hook-form + zod
const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Correo inválido'),
})
```

### Imports
```typescript
// Orden: externos → internos → relativos
import { useState } from 'react'
import { useGetList } from 'react-admin'
import { ContactCard } from '@/components/crm/ContactCard'
import type { Contact } from '@/types'
```

---

## Idioma

**La app es en español.** Sin excepciones para texto visible al usuario.

- Strings en JSX → español directo
- Labels de formularios → `src/i18n/es.ts` (resources)
- Notificaciones/mensajes → `src/i18n/es.ts` (cosmos.notifications)
- El código TypeScript (variables, funciones, comentarios) → inglés

```tsx
// ✅ Correcto
<Button>Guardar cambios</Button>
<EmptyState title="Sin contactos" subtitle="Agrega tu primer prospecto" />

// ❌ Incorrecto
<Button>Save changes</Button>
```

---

## Dominios de Negocio

### Pipeline de Ventas (Deals)
```typescript
// Stages en orden
'prospecto' → 'contactado' → 'reunion' → 'propuesta' → 'negociacion' → 'cerrado_won' | 'cerrado_lost'
```

### Fuentes de Contactos
`instagram` · `linkedin` · `referido` · `whatsapp` · `web` · `evento` · `coldoutreach`

### Tipos de Servicio
`arepay` · `cosmos_crm` · `landing_page` · `webapp` · `consultoria` · `banco_horas`

### Monedas
`USD` · `VES` · `USDT`

---

## Comandos del Proyecto

```bash
make install      # Instalar dependencias (frontend + Supabase local)
make setup        # Setup BD local + migraciones + seed
make start        # Dev server → http://localhost:5173
make test         # Tests unitarios
make test-e2e     # Tests E2E con Playwright
npm run build     # Build de producción → dist/
npm run tsc       # Type check sin compilar
```

---

## Variables de Entorno

```bash
# Requeridas — ver .env.example
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=
VITE_APP_NAME=CosmosCRM
```

**Nunca** commitear `.env`, `.env.local` ni archivos con keys reales.

---

## Multi-Tenant (Fase 2)

La arquitectura multi-tenant usa **shared schema** con `tenant_id` en cada tabla y
RLS de Supabase como mecanismo de aislamiento.

```typescript
// tenant_id SIEMPRE viene del JWT del usuario autenticado
// NUNCA del body del request o de parámetros de URL
const tenantId = jwt.tenant_id // extraído via función SQL get_current_tenant_id()
```

Ver `SECURITY.md` para las políticas RLS completas.

---

## Convenciones de Git

```
feat(tasks): agregar vista de tareas con filtros
fix(contacts): corregir validación de teléfono venezolano
refactor(dashboard): extraer KPI cards a componente separado
style(ui): ajustar espaciado en sidebar
docs: actualizar CLAUDE.md con nuevas convenciones
```

---

## Lo que NO hacer

```
❌ any en TypeScript
❌ Hardcodear colores fuera de las CSS variables del design system
❌ Strings en inglés visibles al usuario
❌ Tablas de Supabase sin RLS
❌ tenant_id tomado del body del request
❌ Componentes de más de 200 líneas
❌ Spinners como único loading state
❌ Listas sin empty state
❌ Commitear archivos .env
❌ Consultas a Supabase sin tipado de retorno
```

---

*CosmosCRM — Tu universo de clientes, en orden. 🌌*
*Arcano Hub · Caracas, Venezuela · Abril 2026*
