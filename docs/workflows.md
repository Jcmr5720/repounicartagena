# Workflow academico de publicaciones

## Modelo oficial

El flujo academico vigente del repositorio queda compuesto por cuatro roles:

- `estudiante`
- `docente`
- `evaluador`
- `admin`

## Estados operativos

Los estados usados por la aplicacion y el flujo oficial son:

1. `borrador`
2. `enviada`
3. `en_evaluacion`
4. `ajustes_solicitados`
5. `aprobada`
6. `rechazada`
7. `publicada`
8. `suspendida`

## Flujo esperado

`docente crea/sube -> docente envia a evaluacion -> evaluador diligencia rubrica -> evaluador aprueba/rechaza/devuelve -> admin publica al final si fue aprobada`

## Catalogo academico

- Los programas academicos consultados por la aplicacion salen de
  `cartagena_producto_programa`.
- Las lineas tematicas salen de `cartagena_producto_linea` y dependen de un
  programa especifico.
- El formulario de subida y los filtros de exploracion respetan esa relacion:
  programa primero, linea despues.
- Las publicaciones heredadas fueron saneadas a `Matemáticas` + `Álgebra`.

## Acciones por rol

### Estudiante

- Explora publicaciones disponibles.
- Ve detalle de publicaciones.
- Guarda y quita favoritos persistentes.

### Docente

- Crea publicaciones.
- Edita publicaciones propias en estados permitidos.
- Envia publicaciones propias a evaluacion.

### Evaluador

- Ve publicaciones enviadas a evaluacion.
- Puede abrir `Ver publicacion completa` sin salir de `/gestion-publicaciones`.
- Registra rubrica academica formal.
- Aprueba, rechaza o devuelve con observaciones desde la misma pantalla.
- Consulta `Historico de mis evaluaciones` con la ultima decision por recurso.

### Admin

- Administra usuarios, roles y publicaciones.
- Puede intervenir sobre el flujo si hace falta.
- Publica recursos aprobados y suspende recursos si corresponde.
- Puede inspeccionar cualquier publicacion completa antes de intervenir.

## Evaluacion formal

La rubrica fija de esta version usa 4 criterios:

1. `calidad_academica`
2. `pertinencia_tematica`
3. `claridad_redaccion`
4. `uso_metadatos_documentacion`

Cada criterio va de 1 a 5 puntos.

### Reglas

- Aprobar exige evaluacion completa.
- Aprobar exige minimo `16/20`.
- Rechazar exige evaluacion completa y justificacion.
- Devolver exige evaluacion completa y observaciones o mejoras.
- No existe decision sin evidencia academica persistida.

## Trazabilidad

Cada transicion queda registrada en `cartagena_publication_workflow_events` con:

- `publication_id`
- `user_id`
- `role`
- `action`
- `previous_status`
- `next_status`
- `comments`
- `created_at`

## Verificacion previa a la decision

La gestion academica ya no obliga a decidir a ciegas. Desde
`/gestion-publicaciones`, `admin` y `evaluador` pueden revisar:

- informacion general completa del recurso
- identidad minima del docente/subidor
- metadatos Dublin Core + LOM
- PDF o descarga si existe
- bitacora del flujo
- evaluacion academica mas reciente
