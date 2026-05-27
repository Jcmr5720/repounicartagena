# Implementacion de roles, permisos y workflow academico

## Resumen

El sistema ya no trabaja solo con publicacion y moderacion basica. Ahora implementa
un flujo academico real con roles diferenciados, estados auditables y evidencia
visible en frontend y Supabase.

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

### Tablas nuevas

- `public.cartagena_publication_reviews`
- `public.cartagena_publication_evaluations`
- `public.cartagena_publication_workflow_events`

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
- `/gestion-publicaciones`: evaluacion formal y decisiones academicas.
- `/admin`: administracion total del sistema.

### Evidencia visible

- El estudiante ve estado academico, visibilidad y observaciones.
- El docente ve botones `Revisar`, `Solicitar ajustes` y `Enviar a evaluacion`.
- El evaluador ve `Evaluar`, `Aprobar`, `Rechazar` y `Devolver con observaciones`.
- El admin conserva acciones globales y puede `Publicar` o `Suspender`.

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

## Migraciones relevantes

- `supabase/migrations/20260522000200_roles_profiles_documents.sql`
- `supabase/migrations/20260523000300_cartagena_producto_programa.sql`
- `supabase/migrations/20260527000100_cartagena_role_expansion.sql`
- `supabase/migrations/20260527000200_cartagena_academic_workflow.sql`

## Verificacion esperada

- `npm run lint`
- `npm run build`
- aplicacion de migraciones y despliegue de funcion `cartagena_upload`
