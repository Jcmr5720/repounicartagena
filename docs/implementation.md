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
- La misma pantalla ahora separa claramente `Ver publicacion completa` de
  `Evaluar`, para evitar decisiones sin inspeccion previa del recurso.
- `components/publication-detail-modal.tsx` y
  `components/publication-detail-content.tsx` reutilizan el detalle completo
  dentro del flujo de gestion.
- El evaluador diligencia rubrica, puntajes, concepto, fortalezas, mejoras y
  observaciones en el mismo lugar.
- `evaluador` ve ademas `Historico de mis evaluaciones` con la ultima decision
  registrada por publicacion.
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
- `components/header.tsx` muestra un badge numerico sobre el corazon con la
  cantidad real de favoritos, tambien visible en movil.

## Supabase

### Objetos principales

- `cartagena_publication_evaluations`
- `cartagena_publication_workflow_events`
- `cartagena_publication_favorites`
- `cartagena_producto_programa`
- `cartagena_producto_linea`
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

### Catalogo academico normalizado

- Los programas academicos viven en `cartagena_producto_programa`.
- Las lineas tematicas viven en `cartagena_producto_linea`.
- Cada fila de `cartagena_producto_linea` pertenece a un programa mediante
  `programa_id`.
- Las publicaciones de `cartagena_producto_producto` usan `programa_id` y
  `linea_id` como referencia normalizada.
- `linea_tematica` se conserva por compatibilidad, pero se sincroniza desde
  `cartagena_producto_linea.nombre`.
- El saneamiento historico reasigno todas las publicaciones existentes a
  `Matemáticas` + `Álgebra`.

### Frontend y validacion

- `components/upload-page.tsx` obliga a seleccionar programa antes de habilitar
  la linea tematica.
- Las lineas visibles dependen del programa seleccionado.
- `components/explore-page.tsx` filtra lineas por programa y ya no muestra
  catalogo heredado.
- `supabase/functions/cartagena_upload/index.ts` valida que la relacion entre
  `programa_id` y `linea_id` exista realmente en `cartagena_producto_linea`.

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
- `components/publication-detail-modal.tsx`
- `components/publication-detail-content.tsx`
- `components/publication-favorite-button.tsx`
- `supabase/migrations/20260527000500_cartagena_publication_owner_summaries.sql`
- `supabase/migrations/20260527000400_cartagena_docente_workflow_favorites.sql`
