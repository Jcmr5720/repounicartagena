# Implementacion de roles, workflow, favoritos y evaluacion

## Resumen

La implementacion conserva la estructura funcional existente y la adapta al
modelo oficial del proyecto:

- `estudiante` consume contenido y guarda favoritos
- `docente` crea y envia publicaciones a evaluacion
- `evaluador` decide desde una pantalla formal unica
- `admin` administra y publica al final por compatibilidad institucional

## Frontend

### Navegacion

- `components/header.tsx` muestra `/subir` solo a `docente` y `admin`.
- Los usuarios autenticados ven un corazon con dropdown de favoritos.
- `estudiante` no ve acceso a `/subir`.

### Gestion docente

- `components/upload-page.tsx` ya no describe una subida estudiantil.
- El docente crea, actualiza y envia sus recursos a evaluacion.
- El estudiante queda bloqueado incluso si intenta entrar manualmente a `/subir`.

### Evaluacion formal

- `components/publication-management-page.tsx` mantiene una sola pantalla de
  evaluacion formal.
- El evaluador diligencia rubrica, puntajes, concepto, fortalezas, mejoras y
  observaciones en el mismo lugar.
- La decision no implica publicacion final automatica; `admin` conserva ese paso.

### Moderacion

- `components/moderation-page.tsx` deja de representar una etapa activa del
  flujo oficial.
- La ruta se conserva como vista de compatibilidad e informacion operativa.

### Favoritos

- `components/publication-favorite-button.tsx` centraliza la accion de guardar o
  quitar favoritos.
- El boton se reutiliza en tarjetas, listados y detalle.
- El estado cambia en caliente usando `lib/publications-context.tsx`.

## Supabase

### Objetos principales

- `cartagena_publication_evaluations`
- `cartagena_publication_workflow_events`
- `cartagena_publication_favorites`
- `cartagena_apply_publication_workflow_action(...)`
- `cartagena_upsert_publication_evaluation(...)`

### Favoritos persistentes

La tabla `cartagena_publication_favorites` guarda:

- `id`
- `user_id`
- `publication_id`
- `created_at`

Se impone unicidad por `user_id + publication_id` y RLS para que cada usuario
solo vea, cree y elimine sus propios favoritos.

### Workflow actualizado

- `docente` envia a evaluacion mediante `submit_for_review`.
- `evaluador` decide sobre publicaciones `enviada` o `en_evaluacion`.
- `admin` conserva `publish` y `suspend`.

### Evaluacion academica

La evaluacion se persiste en `cartagena_publication_evaluations` con:

- `criteria_scores`
- `total_score`
- `decision`
- `strengths`
- `improvements`
- `comments`
- `evaluated_at`

Se bloquea:

- aprobar sin evaluacion completa
- rechazar sin justificacion
- devolver sin observaciones o mejoras

## Archivos clave

- `lib/permissions.ts`
- `lib/types.ts`
- `lib/publications-context.tsx`
- `components/header.tsx`
- `components/upload-page.tsx`
- `components/publication-management-page.tsx`
- `components/publication-favorite-button.tsx`
- `supabase/migrations/20260527000400_cartagena_docente_workflow_favorites.sql`
