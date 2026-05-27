import type { Publication } from "@/lib/types";

export type MetadataStandard = "Dublin Core" | "LOM";

export interface PublicationMetadataField {
  standard: MetadataStandard;
  key: string;
  label: string;
  value: string;
  justification: string;
}

export interface PublicationMetadataGroup {
  standard: MetadataStandard;
  title: string;
  description: string;
  fields: PublicationMetadataField[];
}

function formatDate(value?: string) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function joinKeywords(keywords: string[]) {
  return keywords.filter(Boolean).join(", ");
}

function formatLanguage() {
  return "es";
}

function formatRights() {
  return "Acceso según permisos del repositorio";
}

export function getPublicationMetadataGroups(
  publication: Publication,
): PublicationMetadataGroup[] {
  const keywords = publication.palabrasClave ?? [];
  const subject = [publication.lineaTematica, joinKeywords(keywords)]
    .filter(Boolean)
    .join(" · ");
  const publicationDate = formatDate(publication.fechaPublicacion ?? publication.created_at);

  return [
    {
      standard: "Dublin Core",
      title: "Perfil Dublin Core",
      description:
        "Campos descriptivos básicos para identificar, recuperar y citar el recurso.",
      fields: [
        {
          standard: "Dublin Core",
          key: "dc:title",
          label: "Título",
          value: publication.titulo,
          justification:
            "Identifica el recurso en la búsqueda, la ficha y la vista pública.",
        },
        {
          standard: "Dublin Core",
          key: "dc:creator",
          label: "Creador",
          value: publication.autor,
          justification:
            "Registra la autoría principal del documento y su responsabilidad intelectual.",
        },
        {
          standard: "Dublin Core",
          key: "dc:description",
          label: "Descripción",
          value: publication.resumen,
          justification:
            "Resume el contenido para ayudar a decidir si el recurso es pertinente.",
        },
        {
          standard: "Dublin Core",
          key: "dc:subject",
          label: "Tema",
          value: subject || publication.programa,
          justification:
            "Agrupa línea temática y palabras clave para mejorar recuperación temática.",
        },
        {
          standard: "Dublin Core",
          key: "dc:date",
          label: "Fecha",
          value: publicationDate,
          justification:
            "Sitúa temporalmente la publicación para citas, ordenamiento y consulta.",
        },
        {
          standard: "Dublin Core",
          key: "dc:identifier",
          label: "Identificador",
          value: publication.id,
          justification:
            "Permite referenciar de forma única cada publicación dentro del sistema.",
        },
        {
          standard: "Dublin Core",
          key: "dc:format",
          label: "Formato",
          value: "application/pdf",
          justification:
            "Describe el tipo de archivo distribuido y su condición de acceso.",
        },
        {
          standard: "Dublin Core",
          key: "dc:language",
          label: "Idioma",
          value: formatLanguage(),
          justification:
            "Declara el idioma principal del recurso para recuperación y lectura asistida.",
        },
        {
          standard: "Dublin Core",
          key: "dc:publisher",
          label: "Editor",
          value: "Repositorio REDS Colombia",
          justification:
            "Ubica el recurso dentro del contexto institucional que lo publica.",
        },
        {
          standard: "Dublin Core",
          key: "dc:rights",
          label: "Derechos",
          value: formatRights(),
          justification:
            "Aclara que el acceso y uso dependen de las reglas del repositorio.",
        },
      ],
    },
    {
      standard: "LOM",
      title: "Perfil LOM",
      description:
        "Campos educativos y técnicos útiles para recursos académicos y de aprendizaje.",
      fields: [
        {
          standard: "LOM",
          key: "general.title",
          label: "General / title",
          value: publication.titulo,
          justification:
            "Mantiene el nombre principal del recurso dentro del bloque general.",
        },
        {
          standard: "LOM",
          key: "general.keyword",
          label: "General / keyword",
          value: joinKeywords(keywords) || "Sin palabras clave",
          justification:
            "Apoya la clasificación temática y la recuperación por términos clave.",
        },
        {
          standard: "LOM",
          key: "lifeCycle.contribute",
          label: "Life cycle / contribute",
          value: `Autor principal: ${publication.autor}`,
          justification:
            "Registra la contribución primaria asociada a la producción del recurso.",
        },
        {
          standard: "LOM",
          key: "educational.context",
          label: "Educational / context",
          value: "Educación superior",
          justification:
            "Alinea el recurso con el entorno institucional y académico del repositorio.",
        },
        {
          standard: "LOM",
          key: "educational.description",
          label: "Educational / description",
          value: publication.lineaTematica,
          justification:
            "Relaciona el recurso con su orientación disciplinar o pedagógica.",
        },
        {
          standard: "LOM",
          key: "technical.format",
          label: "Technical / format",
          value: "PDF",
          justification:
            "Especifica el formato técnico disponible para descarga y consulta.",
        },
        {
          standard: "LOM",
          key: "classification.taxonPath",
          label: "Classification / taxonPath",
          value: publication.programa,
          justification:
            "Vincula el recurso con el programa académico correspondiente.",
        },
        {
          standard: "LOM",
          key: "classification.description",
          label: "Classification / description",
          value: subject || publication.lineaTematica,
          justification:
            "Refuerza la categoría temática usada para clasificar el contenido.",
        },
      ],
    },
  ];
}

export function getPublicationMetadataSummary(publication: Publication) {
  const date = formatDate(publication.fechaPublicacion ?? publication.created_at);
  return `${publication.titulo} de ${publication.autor}, ${publication.programa}, ${publication.lineaTematica}, publicado el ${date}.`;
}
