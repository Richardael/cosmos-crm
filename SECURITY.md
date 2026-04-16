# 🔐 SECURITY.md — CosmosCRM
> Políticas y directrices de seguridad. Todo desarrollador debe leer este archivo.

---

## Modelo de Seguridad

CosmosCRM opera con una arquitectura de **defensa en capas**:

```
┌─────────────────────────────────────────────────────┐
│  CAPA 1: Autenticación         Supabase Auth         │
│  CAPA 2: Autorización          react-admin + roles   │
│  CAPA 3: Aislamiento de datos  Supabase RLS          │
│  CAPA 4: Validación de inputs  Zod schemas           │
│  CAPA 5: Seguridad HTTP        Headers + CORS        │
└─────────────────────────────────────────────────────┘
```

Si una capa falla, las siguientes deben contener el daño. **Nunca dependas de una sola capa.**

---

## Autenticación

### Supabase Auth
- **Proveedor:** Supabase Auth (email/password)
- **Sesiones:** JWT con refresh token automático — manejado por el cliente de Supabase
- **Duración de sesión:** 1 hora (access token) · 7 días (refresh token)
- **Almacenamiento:** `localStorage` via Supabase client — no manipular manualmente

### Reglas
```typescript
// ✅ Siempre verificar sesión en el servidor antes de operaciones críticas
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('No autenticado')

// ❌ NUNCA confiar solo en el estado del cliente
if (isLoggedIn) { /* ... */ } // Esto no es suficiente para operaciones de escritura
```

### Contraseñas
- Mínimo 8 caracteres
- Hash manejado por Supabase — **nunca hashear contraseñas manualmente** en el cliente
- Reset de contraseña via Supabase `resetPasswordForEmail()` — nunca implementar custom

---

## Autorización y Roles

### Roles del sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `owner` | Dueño del tenant | CRUD total + settings de branding + billing |
| `admin` | Administrador del tenant | CRUD total excepto billing |
| `member` | Usuario estándar | CRUD en sus registros + lectura general |

### Implementación en react-admin
```typescript
// El authProvider debe verificar el rol antes de renderizar recursos sensibles
export const authProvider = {
  checkPermissions: async (params) => {
    const role = await getCurrentUserRole()
    if (params.action === 'delete' && role === 'member') {
      throw new Error('Sin permisos para eliminar')
    }
  }
}
```

---

## Row Level Security (RLS) — Supabase

**Regla absoluta: toda tabla con datos de negocio DEBE tener RLS habilitado.**

### Función helper (debe existir en la BD)
```sql
-- Obtiene el tenant_id del usuario autenticado actual
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id 
  FROM public.tenant_users 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Obtiene el rol del usuario en su tenant
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role 
  FROM public.tenant_users 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

### Template de políticas RLS (aplicar a CADA tabla)
```sql
-- 1. Habilitar RLS
ALTER TABLE public.{tabla} ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.{tabla} FORCE ROW LEVEL SECURITY;

-- 2. SELECT — solo datos de tu tenant
CREATE POLICY "{tabla}_select_own_tenant"
ON public.{tabla} FOR SELECT
USING (tenant_id = public.get_current_tenant_id());

-- 3. INSERT — solo puedes insertar en tu tenant
CREATE POLICY "{tabla}_insert_own_tenant"
ON public.{tabla} FOR INSERT
WITH CHECK (tenant_id = public.get_current_tenant_id());

-- 4. UPDATE — solo datos de tu tenant
CREATE POLICY "{tabla}_update_own_tenant"
ON public.{tabla} FOR UPDATE
USING (tenant_id = public.get_current_tenant_id())
WITH CHECK (tenant_id = public.get_current_tenant_id());

-- 5. DELETE — solo admins/owners pueden borrar
CREATE POLICY "{tabla}_delete_admin_only"
ON public.{tabla} FOR DELETE
USING (
  tenant_id = public.get_current_tenant_id()
  AND public.get_current_user_role() IN ('owner', 'admin')
);
```

### Tablas con RLS obligatorio

| Tabla | Estado |
|-------|--------|
| `contacts` | 🔴 Verificar en cada migración |
| `deals` | 🔴 Verificar en cada migración |
| `companies` | 🔴 Verificar en cada migración |
| `tasks` | 🔴 Verificar en cada migración |
| `activities` | 🔴 Verificar en cada migración |
| `notes` | 🔴 Verificar en cada migración |
| `tenants` | Solo `owner` puede leer/editar su propio tenant |
| `tenant_users` | Solo `owner`/`admin` gestionan miembros |

### Verificar que RLS está activo
```sql
-- Correr esto después de cada migración
SELECT 
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅ RLS activo' ELSE '❌ RLS INACTIVO' END as estado
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Validación de Inputs

**Toda entrada del usuario debe pasar por un schema Zod antes de ser procesada.**

```typescript
// ✅ Schema de contacto — ejemplo de validación correcta
const contactSchema = z.object({
  first_name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  last_name: z.string()
    .min(1, 'El apellido es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  email: z.string()
    .email('Correo electrónico inválido')
    .toLowerCase()
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  source: z.enum(['instagram','linkedin','referido','whatsapp','web','evento','coldoutreach']),
})

// ❌ Nunca insertar en BD sin validar
await supabase.from('contacts').insert(formData) // PELIGROSO
```

### Sanitización
- **SQL Injection:** Imposible via cliente de Supabase (usa prepared statements internamente)
- **XSS:** Evitar `dangerouslySetInnerHTML`. Si es necesario, usar `DOMPurify`
- **Emails:** Siempre `.toLowerCase().trim()` antes de guardar
- **Teléfonos:** Guardar solo dígitos + `+` — strip de espacios y guiones al guardar

---

## Variables de Entorno

### Reglas
```bash
# ✅ Variables VITE_ son públicas — van al bundle del navegador
# Solo pueden contener la ANON KEY de Supabase (que es pública por diseño)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...  # Esta key es PÚBLICA — no es un secreto real

# ❌ NUNCA en variables VITE_:
VITE_SUPABASE_SERVICE_ROLE_KEY=  # JAMÁS — acceso root a la BD sin RLS
VITE_JWT_SECRET=                  # JAMÁS
VITE_STRIPE_SECRET_KEY=           # JAMÁS
```

### Service Role Key
La `service_role_key` de Supabase **bypassa RLS completamente**. Solo debe usarse:
- En scripts de migración ejecutados localmente
- En Edge Functions de Supabase (server-side)
- **NUNCA** en el frontend

---

## Seguridad HTTP

### Headers recomendados (nginx.conf en producción)
```nginx
# Ya incluidos en el nginx.conf del Dockerfile
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";

# Agregar en próxima iteración
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; ...";
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
```

### CORS
- Configurado en Supabase Dashboard → Authentication → URL Configuration
- `Site URL` y `Redirect URLs` deben estar explícitamente permitidas
- **Nunca usar wildcard `*`** en producción

---

## Gestión de Archivos (Supabase Storage)

```typescript
// ✅ Bucket público para logos de tenant (son imágenes de branding)
// Bucket: 'tenant-logos' — acceso público de lectura
const { data } = supabase.storage
  .from('tenant-logos')
  .getPublicUrl(`${tenantId}/logo.png`)

// ✅ Validar tipo y tamaño ANTES de subir
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

if (file.size > MAX_SIZE) throw new Error('El archivo es demasiado grande (máx 2MB)')
if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Tipo de archivo no permitido')

// ✅ Nombre de archivo: siempre usar UUID o hash — nunca el nombre original del usuario
const fileName = `${tenantId}/${crypto.randomUUID()}.${ext}`
```

---

## Exposición de Datos

### Qué NO retornar nunca en queries
```typescript
// ❌ Nunca seleccionar todo con * en tablas que contienen datos sensibles
const { data } = await supabase.from('tenant_users').select('*')

// ✅ Seleccionar solo los campos necesarios
const { data } = await supabase
  .from('tenant_users')
  .select('id, role, user_id')
```

### Logs
- **No loguear** JWTs, passwords, service keys ni datos PII de contactos en `console.log`
- En producción, los errores deben ir a un servicio de monitoring (Sentry) — no al cliente

---

## Checklist de Seguridad — Antes de cada PR

```
□ ¿Toda tabla nueva tiene RLS habilitado?
□ ¿Las políticas RLS cubren SELECT, INSERT, UPDATE y DELETE?
□ ¿Los inputs del usuario pasan por un schema Zod?
□ ¿No hay `any` en TypeScript que pueda ocultar datos sin tipo?
□ ¿Las variables de entorno nuevas están documentadas en .env.example?
□ ¿No se commitea ningún secreto o key real?
□ ¿Las queries de Supabase tienen tipo de retorno definido?
□ ¿Los archivos subidos se validan por tipo y tamaño?
```

---

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en CosmosCRM:

1. **No abrir un issue público** en GitHub
2. Notificar directamente a Richard Echenique: `richard@arcanohub.com`
3. Incluir: descripción, pasos para reproducir, impacto potencial
4. Se responderá en menos de 48 horas

---

*Arcano Hub · Seguridad primero, siempre. 🔐*
*Última revisión: Abril 2026*
