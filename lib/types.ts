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
  title: string;
  titulo: string;
  description: string;
  resumen: string;
  autor: string;
  programa_id: string;
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

export const PROGRAMAS_ACADEMICOS = [
  "Ingeniería de Sistemas",
  "Ingeniería Civil",
  "Ingeniería Ambiental",
  "Ingeniería Química",
  "Medicina",
  "Enfermería",
  "Odontología",
  "Derecho",
  "Administración de Empresas",
  "Contaduría Pública",
  "Economía",
  "Licenciatura en Matemáticas",
  "Licenciatura en Lenguas Extranjeras",
  "Trabajo Social",
  "Comunicación Social",
  "Historia",
  "Filosofía",
  "Química Farmacéutica",
];

export const LINEAS_TEMATICAS = [
  "Tecnología Educativa",
  "Medio Ambiente",
  "Derecho Digital",
  "Ingeniería Estructural",
  "Salud Pública",
  "Pedagogía",
  "Desarrollo de Software",
  "Inteligencia Artificial",
  "Gestión Empresarial",
  "Ciencias Sociales",
];

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
