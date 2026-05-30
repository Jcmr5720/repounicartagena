# ENTREGABLE

Este archivo resume el estado tecnico del proyecto y la evidencia principal por
criterio.

## Pregunta 1

**Enunciado:**  
El contexto educativo esta definido, con una justificacion precisa y pertinente. El diseno del repositorio se adapta completamente a las necesidades del contexto.

**Estado:**  
Implementado.

**Respuesta tecnica:**  
El proyecto define un repositorio academico con consulta publica y flujo interno
de control. La arquitectura combina exploracion, detalle, gestion docente,
evaluacion formal y administracion institucional.

La evidencia principal esta en `app/como-funciona/page.tsx`,
`docs/implementation.md`, `docs/workflows.md`, `lib/permissions.ts` y
`lib/types.ts`.

**Conclusion:**  
Si esta implementado.

## Pregunta 2

**Enunciado:**  
Presenta una estructura clara, coherente e innovadora. Incluye funcionalidades completas (carga/descarga, evaluacion, flujos de trabajo) bien articuladas.

**Estado:**  
Implementado.

**Respuesta tecnica:**  
La plataforma ya no trata la evaluacion como una idea o un boton simple. Existe
un modulo formal y persistente de evaluacion academica con rubrica fija,
puntajes, concepto, fortalezas, mejoras, observaciones y decision final en la
misma pantalla del evaluador.

La evidencia principal esta en:

- `components/evaluation-form.tsx`
- `components/publication-management-page.tsx`
- `lib/publications-context.tsx`
- `supabase/migrations/20260527000300_cartagena_evaluation_rubric.sql`
- `supabase/migrations/20260527000400_cartagena_docente_workflow_favorites.sql`

La tabla `cartagena_publication_evaluations` persiste como minimo:

- `publication_id`
- `evaluator_id`
- `criteria_scores`
- `total_score`
- `decision`
- `strengths`
- `improvements`
- `comments`
- `evaluated_at`

Ademas, el sistema impide decisiones sin evidencia academica completa antes de
aprobar, rechazar o devolver con observaciones.

Tambien queda implementada la verificacion previa del recurso dentro de
`/gestion-publicaciones`: `admin` y `evaluador` ahora pueden abrir
`Ver publicacion completa` y revisar metadatos, PDF, bitacora, evaluacion,
observaciones, puntaje, fortalezas, mejoras y datos del docente/subidor antes
de decidir.

Tambien se implementa carga de PDF, detalle descargable, workflow de estados y
favoritos persistentes en Supabase.

**Conclusion:**  
Si esta implementado.

## Pregunta 3

**Enunciado:**  
Se seleccionan y justifican metadatos relevantes, basados en estandares como LOM o Dublin Core. Estan alineados con los tipos de recursos y el contexto.

**Estado:**  
Implementado.

**Respuesta tecnica:**  
El sistema expone titulo, autor, descripcion, programa academico, anio, linea
tematica y palabras clave, alineados con el contexto de recursos digitales
academicos. La normalizacion se apoya en `lib/publication-metadata.ts` y su
representacion visual en `components/publication-metadata-section.tsx`.

Adicionalmente, el catalogo academico ya no depende solo de listas planas en
frontend: `cartagena_producto_programa` normaliza los programas y
`cartagena_producto_linea` normaliza las lineas tematicas por programa. Las
publicaciones conservan compatibilidad visual con `linea_tematica`, pero la
relacion real queda asegurada con `programa_id` + `linea_id`. El saneamiento
tecnico reasigno todas las publicaciones historicas a `Matemáticas` +
`Álgebra`.

**Conclusion:**  
Si esta implementado.

## Pregunta 4

**Enunciado:**  
Se describen claramente los distintos roles (administrador, docente, estudiante, evaluador) y se establecen flujos de trabajo funcionales y realistas.

**Estado:**  
Implementado.

**Respuesta tecnica:**  
Los roles funcionales finales del proyecto quedaron definidos asi:

- `estudiante`: consulta publicaciones, ve detalles y guarda favoritos.
- `docente`: crea o sube publicaciones y las envia a evaluacion.
- `evaluador`: diligencia la evaluacion formal y decide.
- `admin`: administra usuarios, roles, publicaciones y publica al final.

La evidencia principal esta en:

- `lib/types.ts`
- `lib/permissions.ts`
- `lib/publications-context.tsx`
- `components/header.tsx`
- `components/upload-page.tsx`
- `components/publication-management-page.tsx`
- `components/admin-page.tsx`
- `docs/auth.md`
- `docs/workflows.md`

El flujo academico implementado es:

`borrador -> enviada -> en_evaluacion -> ajustes_solicitados / aprobada / rechazada -> publicada / suspendida`

La publicacion final publica sigue en manos de `admin` por compatibilidad y
control institucional.

La misma vista de gestion incorpora ademas `Historico de mis evaluaciones` para
el rol `evaluador`, lo que permite revisar la ultima decision propia por
publicacion.

**Conclusion:**  
Si esta implementado.

## Pregunta 5

**Enunciado:**  
La propuesta incluye un prototipo bien disenado, funcional y esteticamente adecuado. La presentacion es clara, estructurada y creativa.

**Estado:**  
Parcialmente implementado.

**Respuesta tecnica:**  
El prototipo es funcional, consistente y adecuado para el contexto
institucional. La propuesta visual es sobria y clara, con foco en legibilidad,
flujo academico y paneles operativos. El header incorpora contador visible de
favoritos y la pantalla `/gestion-publicaciones` ahora separa mejor la revision
del recurso, la evaluacion y las acciones administrativas.

**Conclusion:**  
La mayor parte del criterio esta implementada, aunque el componente de
creatividad visual es moderado frente a una propuesta mas experimental.

## Pregunta 6

**Enunciado:**  
Evidencia el uso etico de la IAG (para apoyo, redaccion o busqueda), citando las herramientas utilizadas; mantiene autoria academica y pensamiento propio.

**Estado:**  
No implementado.

**Respuesta tecnica:**  
El repositorio no contiene todavia una declaracion formal sobre uso etico de
IAG, herramientas utilizadas ni delimitacion de autoria.

**Conclusion:**  
No esta implementado como evidencia documental dentro del repo.

## Pregunta 7

**Enunciado:**  
Aplica las normas APA 7.ª edicion en citas textuales, parafrasis, referencias bibliograficas y formato general del documento.

**Estado:**  
No implementado.

**Respuesta tecnica:**  
La documentacion tecnica es clara, pero no sigue de forma sistematica el formato
APA 7 en citas, referencias y estructura academica.

**Conclusion:**  
No esta implementado todavia.
