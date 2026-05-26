# UI Standard - Repositorio REDS Colombia

Este documento es la referencia visual y editorial del proyecto para agentes IA y personas que trabajen en la interfaz.
La meta no es inventar un sistema nuevo, sino respetar lo que ya existe y extenderlo con coherencia.

## 1. Identidad visual

- El producto se siente limpio, institucional, cercano y ordenado.
- La estética principal es editorial suave, con mucho aire, bordes redondeados y jerarquía clara.
- La interfaz no debe verse como una app genérica ni como una landing saturada.
- La referencia más fuerte del sistema es la vista `/`.
- La base visual usa fondos claros, superficies suaves y un acento cálido para acciones importantes.
- La sensación general debe ser de confianza, legibilidad y facilidad de uso.

## 2. Lo que define el sistema

- Framework: Next.js con App Router.
- Sistema de componentes: `shadcn/ui` con estilo `new-york`.
- Utilidades visuales: Tailwind CSS v4, `class-variance-authority`, `tailwind-merge`.
- Iconografía: `lucide-react`.
- Tema: soporta claro y oscuro mediante variables CSS.
- La tipografía visual del sistema se apoya en `Geist` desde `app/globals.css`.
- `layout.tsx` carga `Inter` como variable del documento, pero la identidad visual no debe romper la línea editorial existente.

## 3. Paleta y tokens

Los colores no deben cambiarse sin una razón fuerte. La referencia real está en `app/globals.css`.

### Tokens principales

- `background`: blanco limpio en claro, gris muy oscuro en dark.
- `foreground`: texto principal de alto contraste.
- `card` / `popover`: superficies limpias, coherentes con el fondo.
- `primary`: acento cálido tipo terracota / naranja rojizo.
- `secondary`: neutro suave.
- `muted`: superficie atenuada para bloques secundarios, separadores visuales y estados vacíos.
- `accent`: variante clara del acento, útil para hover y microinteracciones.
- `destructive`: rojo para acciones peligrosas.
- `border` / `input`: grises muy suaves para delimitar sin endurecer.
- `ring`: sigue el acento principal para foco visual consistente.

### Valores reales de la base

Estos son los tokens que hoy gobiernan la identidad del sitio:

- `background`: `oklch(1 0 0)` en claro / `oklch(0.145 0 0)` en dark.
- `foreground`: `oklch(0.145 0 0)` en claro / `oklch(0.985 0 0)` en dark.
- `primary`: `oklch(0.65 0.2 41)` en claro.
- `primary-foreground`: `oklch(1 0 0)`.
- `secondary`: `oklch(0.97 0 0)` en claro.
- `muted`: `oklch(0.96 0.005 90)` en claro.
- `accent`: `oklch(0.75 0.15 41)` en claro.
- `destructive`: `oklch(0.577 0.245 27.325)` en claro.
- `border`: `oklch(0.9 0 0)` en claro.
- `input`: `oklch(0.92 0 0)` en claro.
- `ring`: `oklch(0.65 0.2 41)` en claro.

### Lectura práctica de la paleta

- El sitio no usa un estilo “purple app”.
- El acento debe sentirse cálido, humano y editorial.
- Los fondos decorativos se usan con mucha moderación.
- Los degradados deben apoyar la jerarquía, no competir con el contenido.

### Cómo se ve el color en la interfaz

- El blanco domina la lectura en pantallas de contenido.
- `primary` aparece en CTAs, badges, estados activos, foco y palabras destacadas del hero.
- `primary/5`, `primary/10` y `primary/20` se usan como apoyos suaves, nunca como fondo dominante.
- `muted/30`, `muted/40` y `muted/50` se usan para separar secciones, vacíos y bloques secundarios.
- Los bordes casi siempre deben sentirse presentes pero discretos.
- Los estados de peligro usan rojo, pero solo donde realmente hay una acción destructiva.
- En dark mode, la lógica visual debe conservar el mismo contraste, no solo invertir colores.

### Reglas de estilo visual

- El sistema se basa en superficies limpias, no en adornos pesados.
- Las tarjetas deben sentirse firmes pero livianas, con sombra suave y borde tenue.
- Los degradados del home son ambientales, no protagonistas.
- La home `/` usa una mezcla de fondo claro, una malla sutil y bloques bien espaciados.
- Las vistas internas pueden ser más funcionales, pero nunca deben romper la misma gramática visual.
- La pantalla de autenticación es la excepción más marcada: usa una atmósfera más oscura y cálida, pero sigue siendo parte del mismo producto.

## 4. Tipografía y ritmo

- El texto debe leerse cómodo en desktop y mobile.
- La jerarquía debe estar claramente separada:
  - títulos grandes y con peso
  - subtítulos de apoyo
  - texto secundario atenuado
  - microcopy corto y útil
- El espaciado es amplio y respirado.
- No apretar bloques ni reducir márgenes por optimización visual.
- La composición debe sentirse estable, no apilada.

## 5. Componentes base

Los componentes de `components/ui` son la base de la UI. Si existe uno adecuado, reutilizarlo antes que crear otro nuevo.

### Superficies

- `Card` para bloques estructurados.
- `border` suave y `shadow-sm` como estándar.
- `rounded-xl`, `rounded-2xl` y `rounded-3xl` como radios frecuentes.
- Evitar sombras pesadas.

### Acciones

- `Button` es el CTA principal.
- `default` para acción principal.
- `outline` para acciones secundarias.
- `ghost` para navegación o acciones suaves.
- `link` para navegación textual.

### Señales visuales

- `Badge` para estados, categorías y etiquetas.
- `Input` para búsquedas y formularios.
- `DropdownMenu`, `Dialog`, `Sheet`, `Popover` para interacción compleja sin romper el layout.

## 6. La home `/` como referencia

La home es la mejor guía para cualquier nueva pantalla.
Si hay duda sobre proporciones, color o composición, mirar primero esta ruta.

### Estructura real

1. `HeroSection`
   - Fondo con degradado suave desde `primary/5` hacia `background` y `muted/50`.
   - Rejilla decorativa muy sutil.
   - Badge institucional arriba del título.
   - Título grande con una palabra resaltada en `primary`.
   - Subtítulo explicando el propósito del repositorio.
   - Buscador central, ancho cómodo, alto prominente.
   - Link secundario a búsqueda avanzada.
   - Bloque de estadísticas al final del hero.

2. `QuickAccessCards`
   - Cuatro tarjetas de acceso rápido.
   - Íconos dentro de círculos o placas con `primary/10`.
   - Hover con cambio de borde, sombra y color de acento.
   - Deben leerse como accesos funcionales, no como decoración.

3. `PublicationsSection`
   - Fondo más contenido, tipo `muted/30`.
   - Tarjetas de recursos recientes con programa, año, autor, resumen y etiquetas.
   - Estados vacíos claros y útiles.
   - CTA de detalle con estilo suave, no agresivo.

### Lectura estética de la home

- No es una landing comercial fuerte.
- No es una dashboard dura.
- Es una portada institucional con búsqueda como acción principal.
- El título abre la experiencia, las tarjetas ordenan la navegación y las publicaciones demuestran contenido real.
- La combinación de blanco, neutros suaves y un acento terracota define el carácter visual del sitio.

### Sensación de la home

- Abierta, clara y con foco en búsqueda.
- Más editorial que corporativa pesada.
- Mucho aire arriba, composición centrada y progresión lógica.
- El hero vende la idea, las tarjetas organizan el acceso y las publicaciones dan contenido real.

## 7. Patrones de layout

- Se usan contenedores centrados con `max-w-7xl`.
- El padding horizontal estándar es `px-4 sm:px-6 lg:px-8`.
- Las secciones suelen respirar con `py-16`, `py-12` o similares.
- El header es sticky y funciona como navegación principal.
- El footer cierra la experiencia con información institucional y enlaces clave.
- En páginas internas, el contenido suele vivir dentro de cards o bloques grandes con bordes suaves.

## 8. Mapa de rutas

- `/`:
  - portada principal
  - búsqueda rápida
  - acceso a contenido reciente
  - mejor referencia visual del proyecto
- `/explorar`:
  - búsqueda y filtrado de publicaciones
  - extensión natural de la home
- `/subir`:
  - carga de publicaciones y flujo de edición si aplica
- `/gestion-publicaciones`:
  - administración unificada de documentos
- `/moderacion`:
  - control operativo para moderadores y admin
- `/admin`:
  - administración de usuarios y roles
- `/cuenta`:
  - perfil y configuración del usuario
- `/auth`:
  - autenticación
  - esta vista sigue una estética más oscura y diferenciada
- `/como-funciona`:
  - guía institucional extensa
  - documenta roles, flujo y acciones

## 9. Reglas para agentes IA

- No cambiar la estética base sin necesidad real.
- No introducir una nueva paleta dominante.
- No convertir la UI en algo brillante, ruidoso o excesivamente futurista.
- No reemplazar el lenguaje visual de la home.
- No inventar otra identidad para una sola pantalla.
- Si una pantalla nueva no tiene patrón obvio, tomar la home `/` como referencia primaria.
- Respetar el tono en español: claro, humano, profesional y directo.
- Usar copy simple y útil.
- Mantener la legibilidad por encima de la ornamentación.
- Preferir consistencia a creatividad gratuita.
- Si una variación visual es necesaria, debe seguir pareciendo parte del mismo producto.

## 10. Señales que sí deben repetirse

- Badge institucional pequeño al inicio de bloques clave.
- Títulos grandes con una palabra acentuada en `primary` cuando aporte énfasis.
- Cards limpias con borde suave y sombra ligera.
- Botones con jerarquía clara.
- Estados vacíos con explicación breve y siguiente paso.
- Degradados sutiles solo como soporte visual.
- Etiquetas y filtros con badges neutros o de acento suave.

## 11. Señales que deben evitarse

- Gradientes fuertes sin propósito.
- Sombras pesadas o bordes agresivos.
- Exceso de colores de acento distintos en la misma pantalla.
- Layouts con demasiada densidad.
- Copys fríos, burocráticos o artificiales.
- Componentes nuevos que no respeten `rounded`, `border` y `shadow` del sistema actual.

## 12. Checklist rápido para una nueva pantalla

- ¿Se siente como parte de REDS Colombia?
- ¿Usa la paleta definida en `app/globals.css`?
- ¿Respeta el patrón de cards, spacing y jerarquía?
- ¿Se entiende bien en mobile?
- ¿Hay una acción principal clara?
- ¿El copy está en español natural?
- ¿La pantalla podría convivir con la home `/` sin verse ajena?

## 13. Nota para futuros agentes

- Este archivo existe para evitar reinterpretaciones innecesarias.
- Si hay duda entre dos soluciones visuales, la más simple y consistente suele ser la correcta.
- La home `/` es la mejor prueba de intención visual del proyecto.
- Antes de rediseñar, leer este documento y comparar con la implementación real.
