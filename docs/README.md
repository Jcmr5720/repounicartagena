# Documentación del sistema de roles y permisos

Este directorio resume el trabajo realizado para mover la aplicación a un modelo real de autenticación, perfiles, permisos y documentos soportado por Supabase.

## Contenido

- [`auth.md`](./auth.md): explica el flujo de autenticación, el perfil de usuario y cómo se asignan y protegen los roles.
- [`implementation.md`](./implementation.md): resume los cambios funcionales, la estructura de datos y el comportamiento del frontend.

## Resumen rápido

- La fuente de verdad de permisos ya no depende de `user_metadata` ni de `localStorage`.
- Los usuarios se guardan en `public.cartagena_usuario_usuario`.
- Los documentos se guardan en `public.cartagena_producto_producto`.
- Los programas académicos viven en `public.cartagena_producto_programa` y `cartagena_producto_producto` los referencia con `programa_id`.
- Los permisos se protegen con RLS en Supabase y también se reflejan en el frontend.
