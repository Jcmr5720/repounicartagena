# Autenticación y perfiles

## Objetivo

El proyecto usa Supabase Auth para iniciar sesión y Supabase Database para guardar el perfil real de cada usuario.
La idea principal es que el acceso a funciones no dependa de metadata de Auth ni de estado local del navegador.

## Fuente de verdad

- `auth.users`: maneja credenciales, sesión y autenticación.
- `public.cartagena_usuario_usuario`: maneja el perfil extendido y el rol real del usuario.

## Roles

- `estudiante`
- `moderador`
- `admin`

## Reglas de negocio

- Todo usuario nuevo nace como `estudiante`.
- El rol no se toma desde `user_metadata` para autorizar acciones.
- El usuario autenticado puede ver y editar solo su propio perfil.
- El cambio de rol solo lo puede hacer `admin`.
- `moderador` no puede administrar usuarios.

## Flujo de registro

1. El usuario completa el formulario de registro.
2. Supabase Auth crea la cuenta.
3. Un trigger en la base crea automáticamente el registro en `public.cartagena_usuario_usuario`.
4. El perfil queda con rol `estudiante`.
5. La app lee el perfil desde `public.cartagena_usuario_usuario` y guarda ese rol en el contexto de auth.

## Flujo de inicio de sesión

1. La app autentica contra Supabase Auth.
2. Después del login, el contexto consulta `public.cartagena_usuario_usuario`.
3. El frontend usa ese perfil para mostrar navegación, botones y restricciones.
4. Las acciones sensibles siguen protegidas por RLS en la base.

## Qué puede editar el usuario

- Puede actualizar sus datos de perfil permitidos.
- No puede cambiar su propio rol.
- Puede mantener su cuenta y su información de contacto.

## Seguridad

La app aplica seguridad en dos capas:

- Frontend: oculta o deshabilita acciones no permitidas.
- Backend: RLS bloquea cualquier acción que no cumpla las reglas.

Esto evita que un usuario pueda saltarse la UI e intentar operar directo sobre la API.

## Archivos relacionados

- `lib/auth-context.tsx`
- `lib/permissions.ts`
- `supabase/migrations/20260522000200_roles_profiles_documents.sql`
