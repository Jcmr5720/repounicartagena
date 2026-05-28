# Autenticacion y roles

## Objetivo

El proyecto usa Supabase Auth como proveedor de identidad y
`public.cartagena_usuario_usuario` como fuente de verdad para perfiles, rol
operativo y permisos de navegacion.

## Roles funcionales vigentes

- `estudiante`
- `docente`
- `evaluador`
- `admin`

`moderador` se conserva solo como alias tecnico de compatibilidad y se
interpreta como `evaluador`.

## Reglas de negocio

- Todo usuario nuevo nace como `estudiante`.
- El rol no se autoriza desde `user_metadata`.
- El cambio de rol solo lo hace `admin`.
- La navegacion y los permisos visibles salen del perfil persistido en
  `cartagena_usuario_usuario`.
- Las operaciones sensibles siguen protegidas por RLS, policies y funciones de
  Supabase.

## Efecto real por rol

### Estudiante

- No accede a `/subir`.
- No crea, edita, elimina ni envia publicaciones.
- Explora publicaciones disponibles, ve el detalle y usa favoritos persistentes.

### Docente

- Accede a `/subir`.
- Crea o sube publicaciones propias.
- Edita sus publicaciones en estados permitidos.
- Envia sus publicaciones a evaluacion.
- No evalua ni decide academicamente.

### Evaluador

- Accede a `/gestion-publicaciones`.
- Diligencia rubrica, puntajes, fortalezas, mejoras y observaciones.
- Aprueba, rechaza o devuelve con observaciones desde la misma pantalla.
- No publica al sitio publico final.

### Admin

- Accede a `/admin`, `/subir` y `/gestion-publicaciones`.
- Conserva control total sobre usuarios, roles, publicaciones y estados.
- Publica recursos aprobados y puede suspenderlos.

## Seguridad

La seguridad queda aplicada en dos capas:

- Frontend: oculta rutas y acciones no permitidas por rol.
- Backend: RLS, policies, triggers y RPC bloquean inserciones, actualizaciones,
  eliminaciones y transiciones fuera del flujo academico autorizado.

## Archivos relacionados

- `lib/auth-context.tsx`
- `lib/permissions.ts`
- `lib/types.ts`
- `lib/publications-context.tsx`
- `supabase/migrations/20260527000400_cartagena_docente_workflow_favorites.sql`
