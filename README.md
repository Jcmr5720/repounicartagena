# Repositorio REDS Colombia

Guia operativa para agentes y contribuidores que trabajen en este proyecto.

Este repositorio es una app web en Next.js pensada para publicar, explorar y administrar recursos digitales.  
Antes de cambiar codigo, interfaz o textos, lee esta guia y respeta el lenguaje visual y editorial ya definido en el sitio.

**Regla obligatoria:** antes de hacer cualquier cambio, leer siempre [`UI_STANDAR.MD`](./UI_STANDAR.MD). Ese archivo es la referencia visual oficial del proyecto.

## Que es este proyecto

- Sitio web de recursos digitales para REDS Colombia.
- La experiencia debe sentirse clara, confiable, cercana y facil de usar.
- El objetivo no es lucirse con efectos o patrones raros, sino ayudar al usuario a encontrar, leer, publicar y administrar contenido sin friccion.
- Si una decision nueva rompe la coherencia visual o funcional del sitio, no la tomes por intuicion: revisa primero el contexto existente.

## Sistema visual

- Base visual: limpio, serio y moderno, con una estetica editorial suave.
- No usar estilos genericos tipo "purple app" o interfaces demasiado brillantes/saturadas.
- El sitio usa una paleta neutral con acento calido.
- Debe predominar el equilibrio entre aire, jerarquia y legibilidad.
- Las tarjetas, bordes suaves, sombras ligeras y gradientes sutiles si son utiles; no como decoracion gratuita.
- Los fondos pueden variar entre claro y oscuro, pero siempre deben mantener contraste suficiente y coherencia con el resto del sistema.
- Si agregas una nueva pantalla, debe parecer parte del mismo producto, no una plantilla distinta.

## Tipografia, color y espaciado

- Tipografia principal: `Geist`.
- Estilo de componentes: `shadcn/ui` con configuracion `new-york`.
- Espaciado: generoso, con ritmo visual claro y sin bloques apretados.
- El cuerpo del texto debe leerse comodo en desktop y mobile.
- Usa jerarquia tipografica real:
  - titulos con peso y presencia
  - subtitulos de apoyo
  - texto secundario atenuado
- Respeta los tokens de color definidos en `app/globals.css`.
- No inventes nuevos colores fuertes si no son necesarios.
- Prioridad: legibilidad, contraste y consistencia.

## Tono de marca y copy

- Escribir en espanol claro, cercano y profesional.
- El copy debe sonar humano y directo.
- Frases cortas y utiles.
- Evitar tecnicismos visibles cuando el usuario no los necesita.
- No escribir mensajes frios o burocraticos si se puede decir lo mismo de forma simple.
- En CTA y microcopy usar verbos claros:
  - "Crea tu cuenta"
  - "Explora recursos"
  - "Publica tu REDS"
  - "Ir al inicio"
- En estados vacios, errores y ayudas:
  - explica lo justo
  - no culpes al usuario
  - ofrece el siguiente paso
- Si una pantalla tiene textos de marca, deben sentirse consistentes entre si.

## Reglas de Supabase

- Todo cambio de schema, tabla, funcion, trigger, policy, vista, constraint o index debe subirse directo a Supabase como parte de la misma tarea.
- El agente no debe detenerse a pedir permiso para sincronizar cambios de base de datos.
- Despues de cada peticion que toque Supabase, el estado local y el remoto deben quedar alineados.
- No se deja una implementacion "lista" si solo existe localmente y no fue aplicada o reflejada tambien en el remoto.
- Solo se puede crear, modificar o eliminar objetos cuyo nombre empiece por `cartagena_`.
- Toda tabla, funcion, trigger, policy, vista, constraint e index nuevo debe empezar por `cartagena_`.
- No se debe tocar ningun objeto que no pertenezca al namespace `cartagena_`.
- Esta base de datos comparte espacio con otros proyectos. Cualquier tabla, funcion o recurso sin prefijo `cartagena_` se considera fuera de alcance y no se modifica.
- Si un cambio requiere afectar algo que no empieza por `cartagena_`, eso no se hace por defecto y debe tratarse como una excepcion explicita.
- Cada cambio de base de datos debe quedar bien construido desde la primera entrega:
  - RLS correcto y activado cuando aplique
  - policies claras y bien limitadas
  - constraints bien definidos
  - indexes necesarios para rendimiento, filtros y busquedas
  - llaves primarias y foraneas coherentes
  - nombres consistentes, descriptivos y alineados con `cartagena_`
- Nunca crear tablas, funciones o policies incompletas o sin protecciones minimas.
- Cuando se creen migraciones, deben representar fielmente lo que queda aplicado en el remoto.

## Reglas de implementacion

### Antes de tocar algo

- Revisa la estructura existente.
- Ubica si ya existe una solucion parecida antes de crear una nueva.
- No rompas flujos ya montados por cambiar una sola pantalla.
- Si el cambio afecta auth, datos o navegacion, revisa primero el impacto completo.

### Como programar en este repo

- Reutiliza componentes existentes cuando sea posible.
- Mantiene consistencia con `components/ui` y con el layout actual.
- Prefiere composicion simple a abstraer demasiado pronto.
- Si una nueva pieza visual se repite, conviertela en componente reutilizable.
- Sigue el patron de App Router de Next.js.
- Mantiene los nombres de componentes, props y estados claros y expresivos.
- No renombres cosas por estilo si no aportan claridad.

### UI y maquetacion

- La maquetacion debe verse intencional.
- Usa cards, grids, separadores y columnas solo cuando aporten orden real.
- Evita sobrecargar una pantalla con demasiados elementos visibles a la vez.
- Si introduces animacion, que tenga proposito:
  - dar contexto
  - reforzar jerarquia
  - guiar la atencion
- No usar animaciones por defecto solo porque "se puede".
- Mobile primero: toda pantalla nueva debe verse bien en pantallas pequenas y despues escalar a desktop.

### Auth y datos

- Si cambias auth, revisa tambien:
  - estado de sesion
  - redirecciones
  - proteccion de rutas
  - UI de acceso y registro
- Si cambias datos, respeta la separacion entre:
  - informacion sensible
  - perfil visible
  - respaldo o metadatos
- No guardes contrasenas en tablas de perfil.
- Si una pantalla depende de datos remotos, define bien el estado de carga, error y vacio.
- Si tocas Supabase, deja el remoto y el local alineados en la misma tarea.
- No crees ni modifiques tablas o funciones fuera del namespace `cartagena_`.
- Todo objeto nuevo de base de datos debe llamarse `cartagena_...`.
- Toda estructura nueva debe salir con RLS, constraints, indexes y relaciones bien definidas.

## Reglas para agentes

- No improvises la estetica si ya existe una direccion clara.
- No cambies tokens, tipografia o paleta sin necesidad real.
- No mezcles estilos de varios productos o UI kits.
- No agregues complejidad innecesaria.
- No escribas copy tecnico en pantallas orientadas a usuarios finales.
- No asumas flujos de negocio sin revisar el codigo existente.
- Si hay ambiguedad alta, para y valida antes de decidir.
- Si un cambio toca varias areas, piensa en el efecto en cadena.
- Si una solucion es buena pero inconsistente con el sistema, ajusta la solucion al sistema, no al reves.
- No toques objetos de Supabase que no empiecen por `cartagena_`.
- No cierres tareas de base de datos si remoto y local no quedaron alineados.
- No dejes migraciones sin aplicar si la tarea exigia cambios reales en Supabase.

## Checklist antes de entregar

- `npm run lint`
- `npm run build`
- Revisar que la UI nueva respeta color, tipografia y jerarquia
- Revisar que los textos suenen naturales en espanol
- Confirmar que no se rompio ningun flujo existente
- Confirmar que los cambios son coherentes en mobile y desktop
- Si hubo cambios de auth o datos, revisar el flujo completo de principio a fin
- Si hubo cambios en Supabase, confirmar que remoto y local quedaron alineados
- Si hubo objetos nuevos en base de datos, confirmar que todos usan el prefijo `cartagena_`
- Validar que tablas, funciones y policies nuevas tengan RLS, constraints, indexes y relaciones correctas

## Notas para agentes futuros

- Este repo ya tiene una identidad visual definida. No empieces de cero cada vez.
- La meta es consistencia, claridad y confianza.
- Si una nueva funcionalidad necesita una excepcion visual o textual, deja esa excepcion documentada.
- Cuando tengas duda, elige la opcion mas simple que preserve el lenguaje actual del proyecto.
- Piensa en este sitio como un producto vivo: cada cambio debe encajar con lo que ya existe.
- En Supabase, la prioridad absoluta es proteger el namespace `cartagena_` y no tocar nada de otros proyectos.
- Cada entrega que afecte base de datos debe terminar con el remoto y el local sincronizados.
