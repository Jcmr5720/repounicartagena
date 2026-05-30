export type UserRole =
  | "estudiante"
  | "docente"
  | "evaluador"
  | "moderador"
  | "admin";

export type DocumentStatus = "disponible" | "suspendido";

export type PublicationWorkflowStatus =
  | "borrador"
  | "enviada"
  | "ajustes_solicitados"
  | "en_evaluacion"
  | "aprobada"
  | "rechazada"
  | "publicada"
  | "suspendida";

export type PublicationWorkflowAction =
  | "submit_for_review"
  | "start_evaluation"
  | "approve"
  | "reject"
  | "return_with_observations"
  | "publish"
  | "suspend";

export type EvaluationDecision =
  | "approve"
  | "reject"
  | "return_with_observations";

export type EvaluationCriteriaKey =
  | "calidad_academica"
  | "pertinencia_tematica"
  | "claridad_redaccion"
  | "uso_metadatos_documentacion";

export type EvaluationCriteriaScores = Partial<
  Record<EvaluationCriteriaKey, number>
>;

export interface PublicationEvaluationInput {
  publication_id: string;
  criteria_scores: EvaluationCriteriaScores;
  decision?: EvaluationDecision | null;
  strengths?: string;
  improvements?: string;
  comments?: string;
}

export interface AcademicProgram {
  id: string;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface ThematicLine {
  id: string;
  programa_id: string;
  nombre: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicProgramWithTopics {
  nombre: string;
  lineasTematicas: string[];
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  role: UserRole;
  telefono: string;
  created_at: string;
  updated_at: string;
}

export type User = Profile;

export interface Document {
  id: string;
  owner_id: string;
  owner_name?: string | null;
  owner_username?: string | null;
  title: string;
  titulo: string;
  description: string;
  resumen: string;
  autor: string;
  programa_id: string;
  linea_id: string;
  programa: string;
  año: number;
  lineaTematica: string;
  palabrasClave: string[];
  status: DocumentStatus;
  estado: DocumentStatus;
  workflow_status: PublicationWorkflowStatus;
  workflowStatus: PublicationWorkflowStatus;
  storage_path: string;
  file_name?: string | null;
  file_size?: number | null;
  pdfUrl?: string;
  fechaPublicacion?: string;
  created_at: string;
  updated_at: string;
}

export type Publication = Document;

export interface PublicationWorkflowEvent {
  id: string;
  publication_id: string;
  user_id: string;
  role: UserRole;
  action: PublicationWorkflowAction | string;
  previous_status: PublicationWorkflowStatus | null;
  next_status: PublicationWorkflowStatus;
  comments: string | null;
  created_at: string;
}

export interface PublicationReview {
  id: string;
  publication_id: string;
  reviewer_id: string;
  role: UserRole;
  action: string;
  workflow_status: PublicationWorkflowStatus;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicationEvaluation {
  id: string;
  publication_id: string;
  evaluator_id: string;
  role: UserRole;
  action: string;
  workflow_status: PublicationWorkflowStatus;
  criteria_scores: EvaluationCriteriaScores;
  total_score: number | null;
  decision: EvaluationDecision | null;
  strengths: string | null;
  improvements: string | null;
  comments: string | null;
  evaluated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicationFavorite {
  id: string;
  user_id: string;
  publication_id: string;
  created_at: string;
}

export const EVALUATION_CRITERIA: Array<{
  key: EvaluationCriteriaKey;
  label: string;
  description: string;
}> = [
  {
    key: "calidad_academica",
    label: "Calidad academica",
    description: "Solidez conceptual, rigor y aporte del contenido.",
  },
  {
    key: "pertinencia_tematica",
    label: "Pertinencia tematica",
    description: "Relacion con el programa, la linea y el contexto del recurso.",
  },
  {
    key: "claridad_redaccion",
    label: "Claridad y redaccion",
    description: "Organizacion del texto, comprension y coherencia expositiva.",
  },
  {
    key: "uso_metadatos_documentacion",
    label: "Uso de metadatos y documentacion",
    description: "Completitud del registro, apoyo documental y calidad de presentacion.",
  },
];

export const EVALUATION_DECISION_LABELS: Record<EvaluationDecision, string> = {
  approve: "Aprobar",
  reject: "Rechazar",
  return_with_observations: "Devolver con observaciones",
};

export const ACADEMIC_PROGRAMS_WITH_TOPICS: AcademicProgramWithTopics[] = [
  { nombre: "Matemáticas", lineasTematicas: ["Aritmética", "Álgebra", "Geometría", "Estadística", "Probabilidad"] },
  {
    nombre: "Lengua castellana",
    lineasTematicas: ["Comprensión lectora", "Producción textual", "Gramática", "Literatura", "Ortografía"],
  },
  {
    nombre: "Inglés",
    lineasTematicas: ["Vocabulario", "Gramática inglesa", "Comprensión oral", "Comprensión lectora", "Conversación"],
  },
  {
    nombre: "Ciencias naturales",
    lineasTematicas: ["Seres vivos", "Materia y energía", "Ecosistemas", "Método científico", "Ambiente"],
  },
  { nombre: "Biología", lineasTematicas: ["Célula", "Sistemas del cuerpo humano", "Genética", "Evolución", "Biodiversidad"] },
  {
    nombre: "Química",
    lineasTematicas: ["Materia", "Átomos y moléculas", "Reacciones químicas", "Tabla periódica", "Mezclas y soluciones"],
  },
  { nombre: "Física", lineasTematicas: ["Movimiento", "Fuerza", "Energía", "Electricidad", "Ondas"] },
  {
    nombre: "Ciencias sociales",
    lineasTematicas: ["Sociedad y cultura", "Organización política", "Territorio", "Conflictos sociales", "Derechos humanos"],
  },
  {
    nombre: "Historia",
    lineasTematicas: ["Historia antigua", "Historia de Colombia", "Historia universal", "Independencia", "Siglo XX"],
  },
  { nombre: "Geografía", lineasTematicas: ["Territorio", "Clima", "Relieve", "Población", "Regiones naturales"] },
  {
    nombre: "Constitución política y democracia",
    lineasTematicas: ["Constitución colombiana", "Derechos y deberes", "Participación ciudadana", "Estado colombiano", "Democracia escolar"],
  },
  {
    nombre: "Educación ética y valores humanos",
    lineasTematicas: ["Valores personales", "Convivencia", "Resolución de conflictos", "Responsabilidad", "Proyecto de vida"],
  },
  {
    nombre: "Educación religiosa",
    lineasTematicas: ["Creencias y espiritualidad", "Valores religiosos", "Cultura religiosa", "Respeto por la diversidad", "Sentido de vida"],
  },
  { nombre: "Educación artística y cultural", lineasTematicas: ["Dibujo", "Música", "Teatro", "Danza", "Expresión cultural"] },
  {
    nombre: "Educación física, recreación y deportes",
    lineasTematicas: ["Condición física", "Deportes", "Recreación", "Hábitos saludables", "Trabajo en equipo"],
  },
  {
    nombre: "Tecnología e informática",
    lineasTematicas: ["Herramientas digitales", "Programación básica", "Ofimática", "Internet seguro", "Innovación tecnológica"],
  },
  {
    nombre: "Filosofía",
    lineasTematicas: ["Pensamiento crítico", "Ética filosófica", "Lógica", "Antropología filosófica", "Teoría del conocimiento"],
  },
  {
    nombre: "Ciencias económicas",
    lineasTematicas: ["Economía básica", "Consumo responsable", "Finanzas personales", "Mercado", "Producción"],
  },
  {
    nombre: "Ciencias políticas",
    lineasTematicas: ["Poder político", "Estado y gobierno", "Participación política", "Ciudadanía", "Sistemas políticos"],
  },
  {
    nombre: "Emprendimiento",
    lineasTematicas: ["Ideas de negocio", "Plan de negocio", "Innovación", "Finanzas básicas", "Proyecto productivo"],
  },
  {
    nombre: "Competencias ciudadanas",
    lineasTematicas: ["Convivencia", "Participación democrática", "Pluralidad", "Derechos humanos", "Resolución pacífica de conflictos"],
  },
  {
    nombre: "Lectura crítica",
    lineasTematicas: ["Análisis de textos", "Argumentación", "Inferencia", "Interpretación", "Evaluación de información"],
  },
  {
    nombre: "Proyecto de vida",
    lineasTematicas: ["Autoconocimiento", "Metas personales", "Orientación vocacional", "Toma de decisiones", "Habilidades socioemocionales"],
  },
];

export const PROGRAMAS_ACADEMICOS = ACADEMIC_PROGRAMS_WITH_TOPICS.map(
  (programa) => programa.nombre,
);

export const ALL_LINEAS_TEMATICAS = Array.from(
  new Set(
    ACADEMIC_PROGRAMS_WITH_TOPICS.flatMap((programa) => programa.lineasTematicas),
  ),
).sort((left, right) => left.localeCompare(right, "es"));

export const LINEAS_TEMATICAS = ALL_LINEAS_TEMATICAS;

export function getLineasTematicasByPrograma(programa: string) {
  return (
    ACADEMIC_PROGRAMS_WITH_TOPICS.find((item) => item.nombre === programa)
      ?.lineasTematicas ?? []
  );
}

export function isValidProgramaLinea(programa: string, linea: string) {
  if (!programa || !linea) {
    return false;
  }

  return getLineasTematicasByPrograma(programa).includes(linea);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  estudiante: "Estudiante",
  docente: "Docente",
  evaluador: "Evaluador",
  moderador: "Evaluador",
  admin: "Administrador",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  disponible: "Disponible",
  suspendido: "Suspendido",
};

export const PUBLICATION_WORKFLOW_STATUS_LABELS: Record<
  PublicationWorkflowStatus,
  string
> = {
  borrador: "Borrador",
  enviada: "Enviada",
  ajustes_solicitados: "Ajustes solicitados",
  en_evaluacion: "En evaluacion",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  publicada: "Publicada",
  suspendida: "Suspendida",
};

export const PUBLICATION_WORKFLOW_ACTION_LABELS: Record<
  PublicationWorkflowAction,
  string
> = {
  submit_for_review: "Enviar a evaluacion",
  start_evaluation: "Iniciar evaluacion",
  approve: "Aprobar",
  reject: "Rechazar",
  return_with_observations: "Devolver con observaciones",
  publish: "Publicar",
  suspend: "Suspender",
};
