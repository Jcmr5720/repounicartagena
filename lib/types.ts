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
  | "en_revision_docente"
  | "ajustes_solicitados"
  | "enviada_a_evaluacion"
  | "en_evaluacion"
  | "aprobada"
  | "rechazada"
  | "publicada"
  | "suspendida";

export type PublicationWorkflowAction =
  | "submit_for_review"
  | "start_docente_review"
  | "request_adjustments"
  | "send_to_evaluation"
  | "start_evaluation"
  | "approve"
  | "reject"
  | "return_with_observations"
  | "publish"
  | "suspend";

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
  comments: string | null;
  created_at: string;
  updated_at: string;
}

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
  en_revision_docente: "En revision docente",
  ajustes_solicitados: "Ajustes solicitados",
  enviada_a_evaluacion: "Enviada a evaluacion",
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
  submit_for_review: "Enviar a revision",
  start_docente_review: "Revisar",
  request_adjustments: "Solicitar ajustes",
  send_to_evaluation: "Enviar a evaluacion",
  start_evaluation: "Evaluar",
  approve: "Aprobar",
  reject: "Rechazar",
  return_with_observations: "Devolver con observaciones",
  publish: "Publicar",
  suspend: "Suspender",
};
