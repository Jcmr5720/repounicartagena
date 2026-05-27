# Workflow academico de publicaciones

## Modelo final

El flujo academico del repositorio queda compuesto por cuatro roles operativos:

- `estudiante`
- `docente`
- `evaluador`
- `admin`

`moderador` se conserva solo como compatibilidad temporal y se interpreta como
`evaluador`.

## Estados del workflow

1. `borrador`
2. `enviada`
3. `en_revision_docente`
4. `ajustes_solicitados`
5. `enviada_a_evaluacion`
6. `en_evaluacion`
7. `aprobada`
8. `rechazada`
9. `publicada`
10. `suspendida`

## Transiciones validas

### Estudiante

- `borrador -> enviada`
- `ajustes_solicitados -> enviada`

### Docente

- `enviada -> en_revision_docente`
- `enviada -> ajustes_solicitados`
- `en_revision_docente -> ajustes_solicitados`
- `enviada -> enviada_a_evaluacion`
- `en_revision_docente -> enviada_a_evaluacion`

### Evaluador

- `enviada_a_evaluacion -> en_evaluacion`
- `enviada_a_evaluacion -> aprobada`
- `en_evaluacion -> aprobada`
- `enviada_a_evaluacion -> rechazada`
- `en_evaluacion -> rechazada`
- `enviada_a_evaluacion -> ajustes_solicitados`
- `en_evaluacion -> ajustes_solicitados`

### Admin

- `aprobada -> publicada`
- `aprobada -> suspendida`
- `publicada -> suspendida`

## Que ve y que hace cada rol

### Estudiante

- Vista principal: `/subir`
- Ve sus publicaciones, su estado academico y la observacion mas reciente.
- Puede editar o eliminar solo segun estado permitido.

### Docente

- Vista principal: `/moderacion`
- Ve la cola docente y la bitacora de cada recurso.
- Acciones visibles: `Revisar`, `Solicitar ajustes`, `Enviar a evaluacion`.

### Evaluador

- Vista principal: `/gestion-publicaciones`
- Ve la cola de evaluacion, la bitacora y el resumen de la ultima evaluacion.
- Acciones visibles:
  - `Iniciar evaluacion`
  - `Guardar evaluacion`
  - `Aprobar`
  - `Rechazar`
  - `Devolver con observaciones`

### Admin

- Vista principal: `/admin`
- Puede entrar tambien a revision y evaluacion.
- Mantiene control total de usuarios, roles, estados y visibilidad publica.

## Trazabilidad

Cada cambio de estado registra como minimo:

- `publication_id`
- `user_id`
- `role`
- `action`
- `previous_status`
- `next_status`
- `comments`
- `created_at`

Ademas, revision y evaluacion formal guardan su propia evidencia en:

- `cartagena_publication_reviews`
- `cartagena_publication_evaluations`

## Evaluacion academica formal

La evaluacion ya no depende solo de un comentario libre. Ahora el evaluador debe
registrar una rubrica formal persistida en Supabase antes de emitir una decision.

### Rubrica fija

Cada publicacion en `en_evaluacion` usa 4 criterios:

1. `calidad_academica`
2. `pertinencia_tematica`
3. `claridad_redaccion`
4. `uso_metadatos_documentacion`

Cada criterio se califica de 1 a 5 puntos.

### Resultado

- total maximo: `20`
- `approve`: requiere evaluacion completa y minimo `16/20`
- `reject`: requiere evaluacion completa y justificacion clara
- `return_with_observations`: requiere evaluacion completa y mejoras u observaciones

### Persistencia

La tabla `cartagena_publication_evaluations` guarda como minimo:

- `publication_id`
- `evaluator_id`
- `criteria_scores`
- `total_score`
- `decision`
- `strengths`
- `improvements`
- `comments`
- `evaluated_at`

### Regla de consistencia

No existe decision sin evidencia.

Antes de ejecutar `approve`, `reject` o `return_with_observations`, la funcion
`cartagena_apply_publication_workflow_action(...)` valida la ultima evaluacion
formal completa mediante `cartagena_get_latest_complete_evaluation(...)`.

## Visibilidad publica

La visibilidad publica sigue separada del workflow academico:

- `publicada` sincroniza `status = disponible`
- cualquier otro estado sincroniza `status = suspendido`

Esto mantiene el listado publico sin romper el flujo interno.
