# Perfil de metadatos

Este proyecto usa un perfil de metadatos aplicado sobre los campos reales de publicación para alinearlos con un contexto académico.

## Criterio general

- Se priorizan metadatos descriptivos, técnicos y educativos.
- El perfil combina referencias útiles de **Dublin Core** y **LOM**.
- Los campos se eligieron por su utilidad para búsqueda, citación, recuperación temática y contexto institucional.

## Mapeo aplicado

- `dc:title` / `general.title`: título visible del recurso.
- `dc:creator` / `lifeCycle.contribute`: autor principal.
- `dc:description`: resumen del recurso.
- `dc:subject` / `general.keyword`: línea temática y palabras clave.
- `dc:date`: fecha de publicación.
- `dc:identifier`: identificador único del recurso.
- `dc:format` / `technical.format`: formato PDF.
- `dc:language`: idioma principal.
- `dc:publisher`: Repositorio REDS Colombia.
- `dc:rights`: condiciones de acceso y uso.
- `educational.context`: educación superior.
- `classification.taxonPath`: programa académico.

## Justificación

El repositorio administra recursos digitales académicos, así que los metadatos deben servir para recuperar contenido, entender su contexto disciplinar y distinguir su uso institucional. Por eso se eligieron campos que funcionan bien tanto para consulta pública como para gestión interna.

## Observación

Algunos valores son directos del formulario de publicación y otros son derivados del contexto del recurso, como el idioma, el formato y los derechos de uso.
