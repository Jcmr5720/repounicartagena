export type UserRole = "estudiante" | "moderador" | "admin";

export type DocumentStatus = "disponible" | "suspendido";

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  role: UserRole;
  programa: string;
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
  programa: string;
  año: number;
  lineaTematica: string;
  palabrasClave: string[];
  status: DocumentStatus;
  estado: DocumentStatus;
  storage_path: string;
  file_name?: string | null;
  file_size?: number | null;
  pdfUrl?: string;
  created_at: string;
  updated_at: string;
}

export type Publication = Document;

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
  moderador: "Moderador",
  admin: "Administrador",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  disponible: "Disponible",
  suspendido: "Suspendido",
};
