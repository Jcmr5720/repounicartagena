# Autenticacion y roles

## Objetivo

El proyecto usa Supabase Auth para identidad y `public.cartagena_usuario_usuario`
como fuente de verdad del perfil y del rol aplicado en permisos, navegacion y rutas
protegidas.

## Fuente de verdad

- `auth.users`: credenciales, sesion y autenticacion.
- `public.cartagena_usuario_usuario`: perfil extendido, rol operativo y datos de contacto.

## Roles implementados

- `estudiante`
- `docente`
- `evaluador`
- `admin`

## Compatibilidad con `moderador`

`moderador` se mantiene solo como alias temporal de compatibilidad.

- En datos existentes, la migracion actualiza `moderador` a `evaluador`.
- En frontend y funciones auxiliares, cualquier `moderador` residual se interpreta
  como `evaluador`.
- El modelo academico final visible para el proyecto queda compuesto por
  `estudiante`, `docente`, `evaluador` y `admin`.

## Reglas de negocio

- Todo usuario nuevo nace como `estudiante`.
- El rol no se autoriza desde `user_metadata`.
- El usuario autenticado puede ver y editar solo su propio perfil.
- El cambio de rol solo lo hace `admin`.
- `docente` y `evaluador` no administran usuarios.

## Flujo de registro

1. El usuario completa el formulario de registro.
2. Supabase Auth crea la cuenta.
3. Un trigger crea automaticamente el registro en `public.cartagena_usuario_usuario`.
4. El perfil queda con rol `estudiante`.
5. La app lee ese perfil y lo guarda en el contexto de auth.

## Flujo de inicio de sesion

1. La app autentica contra Supabase Auth.
2. Despues del login, el contexto consulta `public.cartagena_usuario_usuario`.
3. El frontend usa ese perfil para mostrar navegacion, botones y restricciones.
4. Las operaciones sensibles siguen protegidas por RLS en Supabase.

## Efecto real por rol

### Estudiante

- Accede a `/subir`.
- Puede crear borradores, editar sus propios recursos segun estado y enviarlos a revision.
- Ve el estado academico, la visibilidad y las observaciones de sus publicaciones.

### Docente

- Accede a `/moderacion`.
- Puede iniciar revision docente, solicitar ajustes y enviar a evaluacion.
- No puede publicar al sitio publico ni administrar usuarios.

### Evaluador

- Accede a `/gestion-publicaciones`.
- Puede iniciar evaluacion, aprobar, rechazar o devolver con observaciones.
- No puede administrar usuarios ni publicar al sitio publico.

### Admin

- Accede a `/admin`, `/moderacion`, `/gestion-publicaciones` y `/subir`.
- Conserva control total sobre usuarios, roles, publicaciones y estados.
- Publica recursos aprobados y puede suspenderlos.

## Seguridad

La app aplica seguridad en dos capas:

- Frontend: oculta o deshabilita acciones no permitidas.
- Backend: RLS, triggers y funciones bloquean acciones fuera del flujo academico.

## Archivos relacionados

- `lib/auth-context.tsx`
- `lib/permissions.ts`
- `lib/types.ts`
- `supabase/migrations/20260522000200_roles_profiles_documents.sql`
- `supabase/migrations/20260527000100_cartagena_role_expansion.sql`
- `supabase/migrations/20260527000200_cartagena_academic_workflow.sql`
