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
- Ve la cola de evaluacion y la bitacora del recurso.
- Acciones visibles: `Evaluar`, `Aprobar`, `Rechazar`, `Devolver con observaciones`.

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

## Visibilidad publica

La visibilidad publica sigue separada del workflow academico:

- `publicada` sincroniza `status = disponible`
- cualquier otro estado sincroniza `status = suspendido`

Esto mantiene el listado publico sin romper el flujo interno.
