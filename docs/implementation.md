# Implementación de roles, permisos y documentos

## Qué se hizo

Se reemplazó la lógica anterior basada en `user_metadata` y `localStorage` por un modelo real en Supabase.

### Perfiles

- Se adaptó la tabla de perfiles a `public.cartagena_usuario_usuario`.
- Se agregó el rol `moderador`.
- Se creó un trigger para crear perfiles automáticamente al registrarse un usuario.
- Se activó RLS con políticas para lectura y actualización segura.

### Documentos

- Se creó `public.cartagena_producto_producto`.
- Se normalizó el campo de programa con `public.cartagena_producto_programa`.
- `cartagena_producto_producto` ahora guarda `programa_id` como FK al catálogo de programas.
- Se agregó el estado `disponible | suspendido`.
- Se conectó la gestión de documentos a Supabase Database y Supabase Storage.
- Se protegieron las operaciones con RLS.

### Frontend

- El contexto de auth ahora lee el perfil desde `public.cartagena_usuario_usuario`.
- La navegación cambia según rol.
- Se agregó una vista de administración para `admin`.
- Se agregó una vista de moderación para `moderador` y `admin`.
- La pantalla de subida ahora también sirve para editar y eliminar documentos propios.

## Comportamiento por rol

### Estudiante

- Ve documentos disponibles.
- Puede subir documentos.
- Puede editar y eliminar solo los suyos y solo si están disponibles.
- No puede suspender documentos.
- No puede cambiar roles.

### Moderador

- Ve todos los documentos.
- Puede suspender y reactivar documentos.
- No puede administrar usuarios.
- No puede cambiar roles.

### Admin

- Tiene acceso total.
- Puede administrar usuarios.
- Puede cambiar roles.
- Puede editar, eliminar, suspender y reactivar cualquier documento.

## Migración principal

Archivo:

- `supabase/migrations/20260522000200_roles_profiles_documents.sql`
- `supabase/migrations/20260523000300_cartagena_producto_programa.sql`

Esos archivos incluyen:

- enums de rol y estado,
- triggers de sincronización con Auth,
- policies RLS para `cartagena_usuario_usuario`, `cartagena_producto_producto` y `cartagena_producto_programa`,
- policies del bucket de Storage `documents`.

## Verificación

- `npm run lint` pasó.
- `npm run build` pasó.

## Notas

- La historia de migraciones quedó alineada entre local y remoto.
- El esquema remoto recibió la migración nueva.
- Si el entorno local de Supabase no está levantado, la historia sigue alineada en el repo y puede aplicarse al arrancar el stack local.
