# Implementacion de roles, permisos y workflow academico

## Resumen

El sistema ya no trabaja solo con publicacion y moderacion basica. Ahora implementa
un flujo academico real con roles diferenciados, estados auditables, evaluacion
formal con rubrica y evidencia visible en frontend y Supabase.

## Roles y compatibilidad

- Se mantienen como roles tecnicos `estudiante`, `docente`, `evaluador` y `admin`.
- `moderador` queda como compatibilidad temporal y se mapea funcionalmente a
  `evaluador`.
- La UI muestra "Administrador" para `admin`, pero en codigo y base de datos se
  conserva la convencion `admin`.

## Supabase

### Cambios principales

- Se amplio `public.user_role` con `docente` y `evaluador`.
- Se creo el enum `public.cartagena_publication_workflow_status`.
- Se agrego `workflow_status` a `public.cartagena_producto_producto`.
- Se sincroniza la visibilidad publica desde el workflow mediante trigger.
- Se creo la funcion `public.cartagena_apply_publication_workflow_action(...)`
  para ejecutar transiciones validas.
- Se creo la funcion `public.cartagena_upsert_publication_evaluation(...)`
  para guardar la evaluacion academica formal en Supabase.
- Se creo la funcion `public.cartagena_get_latest_complete_evaluation(...)`
  para impedir decisiones sin evidencia academica completa.

### Tablas nuevas

- `public.cartagena_publication_reviews`
- `public.cartagena_publication_evaluations`
- `public.cartagena_publication_workflow_events`

### Evaluacion academica persistida

La tabla `public.cartagena_publication_evaluations` ya no guarda solo acciones
de flujo. Ahora conserva una evaluacion formal con estos campos clave:

- `publication_id`
- `evaluator_id`
- `criteria_scores jsonb`
- `total_score numeric(5,2)`
- `decision`
- `strengths`
- `improvements`
- `comments`
- `evaluated_at`

La rubrica es fija en esta primera version y usa 4 criterios, de 1 a 5 puntos:

- calidad academica
- pertinencia tematica
- claridad y redaccion
- uso de metadatos y documentacion

El total maximo es 20 puntos y queda calculado en base de datos.

### Validaciones de evaluacion

- `approve` exige evaluacion completa y minimo `16/20`.
- `reject` exige evaluacion completa y justificacion clara.
- `return_with_observations` exige evaluacion completa y mejoras u observaciones.
- No puede ejecutarse `approve`, `reject` o `return_with_observations` si no
  existe una evaluacion formal persistida y valida.

### Objetos nuevos con prefijo `cartagena_`

- tablas
- policies
- funciones
- triggers
- enum de workflow

## Permisos implementados

La matriz de permisos quedo centralizada en `lib/permissions.ts`.

### Estudiante

- subir recursos
- editar y eliminar recursos propios segun estado
- enviar a revision

### Docente

- acceder a revision docente
- iniciar revision
- solicitar ajustes
- enviar a evaluacion

### Evaluador

- acceder a evaluacion
- iniciar evaluacion
- diligenciar rubrica
- guardar evaluacion formal
- aprobar
- rechazar
- devolver con observaciones

### Admin

- control total de usuarios, roles y publicaciones
- publicar recursos aprobados
- suspender recursos publicados

## Frontend

### Navegacion

- `components/header.tsx` cambia enlaces segun rol.
- El menu de usuario expone solo rutas permitidas.

### Rutas funcionales

- `/subir`: flujo del estudiante y administracion de recursos propios.
- `/moderacion`: revision docente.
- `/gestion-publicaciones`: evaluacion formal con rubrica, puntajes y decisiones academicas.
- `/admin`: administracion total del sistema.

### Evidencia visible

- El estudiante ve estado academico, visibilidad y observaciones.
- El estudiante ve retroalimentacion de evaluacion cuando la publicacion vuelve
  con ajustes o es rechazada.
- El docente ve botones `Revisar`, `Solicitar ajustes` y `Enviar a evaluacion`.
- El evaluador ve `Iniciar evaluacion`, una rubrica de 4 criterios, el total
  automatico, `Guardar evaluacion`, `Aprobar`, `Rechazar` y `Devolver con observaciones`.
- El admin conserva acciones globales y puede `Publicar` o `Suspender`.
- El detalle del recurso muestra resumen de evaluacion: puntaje, concepto final,
  fortalezas, mejoras, observaciones y fecha.

## Workflow academico

Estados soportados:

- `borrador`
- `enviada`
- `en_revision_docente`
- `ajustes_solicitados`
- `enviada_a_evaluacion`
- `en_evaluacion`
- `aprobada`
- `rechazada`
- `publicada`
- `suspendida`

La bitacora se guarda en `cartagena_publication_workflow_events` y se expone en la
ficha del recurso, en el panel del estudiante, en revision docente y en evaluacion.

La evaluacion formal se guarda en `cartagena_publication_evaluations` y se usa
como requisito previo antes de permitir una decision academica final.

## Migraciones relevantes

- `supabase/migrations/20260522000200_roles_profiles_documents.sql`
- `supabase/migrations/20260523000300_cartagena_producto_programa.sql`
- `supabase/migrations/20260527000100_cartagena_role_expansion.sql`
- `supabase/migrations/20260527000200_cartagena_academic_workflow.sql`
- `supabase/migrations/20260527000300_cartagena_evaluation_rubric.sql`

## Verificacion esperada

- `npm run lint`
- `npm run build`
- aplicacion de migraciones y despliegue de funcion `cartagena_upload`
