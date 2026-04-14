# CosmosCRM

> CRM interno de Arcano Hub — construido sobre [Atomic CRM](https://github.com/marmelab/atomic-crm) (MIT)

**Tu universo de clientes, en orden.**

CosmosCRM es un fork de Atomic CRM adaptado para Arcano Hub. Incluye gestión de contactos, empresas, deals (Kanban), tareas, notas y captura de email entrante.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **UI**: shadcn/ui + shadcn-admin-kit
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)

## Setup

### 1. Dependencias

```bash
npm install
```

### 2. Variables de entorno

Edita `.env.development` con tu URL y clave de Supabase:

```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SB_PUBLISHABLE_KEY=sb_publishable_...
```

### 3. Base de datos (Supabase remoto)

```bash
npx supabase login
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

### 4. Iniciar en desarrollo

```bash
npm run dev
# → http://localhost:5173
```

### 5. Demo local (sin Supabase)

```bash
make start-demo
# Corre con datos mock que se reinician al recargar
```

## Comandos útiles

```bash
make test        # Tests unitarios
make typecheck   # TypeScript type check
make lint        # ESLint + Prettier
make build       # Build de producción
```

## Créditos

Basado en [Atomic CRM](https://github.com/marmelab/atomic-crm) por [marmelab](https://marmelab.com), licencia MIT.
