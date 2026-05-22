export interface User {
  nombre?: string;
  username: string;
  role: "admin" | "estudiante";
  email: string;
  programa: string;
  telefono: string;
}

export interface CartagenaUsuarioUsuario {
  id: string;
  nombre: string;
  correo: string;
  usuario: string;
  created_at: string;
  updated_at: string;
}

export interface Publication {
  id: string;
  titulo: string;
  autor: string;
  programa: string;
  año: number;
  lineaTematica: string;
  resumen: string;
  palabrasClave: string[];
  estado: "publicado" | "en_revision";
  fechaPublicacion: string;
  pdfUrl?: string;
}

export const MOCK_USERS: Record<string, { password: string; user: User }> = {
  admin: {
      password: "hola123",
      user: {
        username: "admin",
        role: "admin",
        email: "admin@redscolombia.co",
        programa: "Administración del Sistema",
        telefono: "+57 300 123 4567",
      },
  },
  prueba: {
      password: "hola123",
      user: {
        username: "prueba",
        role: "estudiante",
        email: "prueba@redscolombia.co",
        programa: "Ingeniería de Sistemas",
        telefono: "+57 311 987 6543",
      },
  },
};

export const INITIAL_PUBLICATIONS: Publication[] = [
  {
    id: "1",
    titulo: "Implementación de Inteligencia Artificial en la Educación Superior Colombiana",
    autor: "María Fernanda López García",
    programa: "Ingeniería de Sistemas",
    año: 2025,
    lineaTematica: "Tecnología Educativa",
    resumen: "Este recurso digital analiza la implementación de herramientas de inteligencia artificial en instituciones de educación superior en Colombia, evaluando su impacto en el aprendizaje y la enseñanza. Se propone un modelo de integración que respeta la pedagogía tradicional mientras aprovecha las capacidades de la IA para personalizar la experiencia educativa.",
    palabrasClave: ["inteligencia artificial", "educación", "tecnología", "aprendizaje"],
    estado: "publicado",
    fechaPublicacion: "2025-03-15",
  },
  {
    id: "2",
    titulo: "Análisis del Impacto Ambiental de la Industria Petroquímica en la Bahía de Cartagena",
    autor: "Carlos Andrés Martínez Ruiz",
    programa: "Ingeniería Ambiental",
    año: 2025,
    lineaTematica: "Medio Ambiente",
    resumen: "Investigación que documenta los efectos de las actividades petroquímicas en el ecosistema marino de la Bahía de Cartagena. Se presentan datos de calidad del agua, biodiversidad y propuestas de mitigación para reducir el impacto ambiental en la región.",
    palabrasClave: ["medio ambiente", "contaminación", "bahía", "petroquímica"],
    estado: "publicado",
    fechaPublicacion: "2025-02-20",
  },
  {
    id: "3",
    titulo: "Protección de Datos Personales en el Contexto del Comercio Electrónico Colombiano",
    autor: "Laura Victoria Jiménez Pérez",
    programa: "Derecho",
    año: 2024,
    lineaTematica: "Derecho Digital",
    resumen: "Estudio jurídico sobre la normativa colombiana de protección de datos personales aplicada al comercio electrónico. Se analizan casos de violación de privacidad y se proponen reformas legislativas para fortalecer los derechos de los consumidores digitales.",
    palabrasClave: ["derecho", "privacidad", "comercio electrónico", "datos personales"],
    estado: "publicado",
    fechaPublicacion: "2024-11-10",
  },
  {
    id: "4",
    titulo: "Sistema de Monitoreo de Estructuras Mediante Sensores IoT",
    autor: "Juan Pablo Herrera Gómez",
    programa: "Ingeniería Civil",
    año: 2025,
    lineaTematica: "Ingeniería Estructural",
    resumen: "Desarrollo de un sistema de monitoreo estructural basado en Internet de las Cosas para edificaciones en zonas sísmicas. El recurso digital incluye el diseño de sensores de bajo costo y una plataforma web para visualización de datos en tiempo real.",
    palabrasClave: ["IoT", "estructuras", "monitoreo", "ingeniería civil"],
    estado: "publicado",
    fechaPublicacion: "2025-01-25",
  },
  {
    id: "5",
    titulo: "Estrategias de Prevención del Dengue en Comunidades Vulnerables de Cartagena",
    autor: "Ana María Rodríguez Silva",
    programa: "Medicina",
    año: 2024,
    lineaTematica: "Salud Pública",
    resumen: "Investigación de campo que evalúa la efectividad de diferentes estrategias de prevención del dengue en barrios vulnerables de Cartagena. Se propone un modelo comunitario de control vectorial que involucra a los habitantes en la eliminación de criaderos.",
    palabrasClave: ["salud pública", "dengue", "prevención", "comunidades"],
    estado: "publicado",
    fechaPublicacion: "2024-09-05",
  },
  {
    id: "6",
    titulo: "Metodologías Activas en la Enseñanza de Matemáticas en Educación Básica",
    autor: "Pedro José Vargas Castro",
    programa: "Licenciatura en Matemáticas",
    año: 2025,
    lineaTematica: "Pedagogía",
    resumen: "Recurso digital de investigación-acción que implementa metodologías activas como el aprendizaje basado en problemas y la gamificación en la enseñanza de matemáticas. Los resultados muestran mejoras significativas en el rendimiento y la motivación de los estudiantes.",
    palabrasClave: ["educación", "matemáticas", "pedagogía", "metodologías activas"],
    estado: "publicado",
    fechaPublicacion: "2025-04-01",
  },
];

export const UPDATES = [
  {
    id: "1",
    titulo: "Nueva guia para subir recursos digitales en PDF",
    fecha: "Mayo 2026",
  },
  {
    id: "2",
    titulo: "Convocatoria abierta para trabajos destacados del semestre",
    fecha: "Mayo 2026",
  },
  {
    id: "3",
    titulo: "Mejoras en la búsqueda por programa académico",
    fecha: "Abril 2026",
  },
  {
    id: "4",
    titulo: "Repositorio REDS Colombia inicia su fase piloto",
    fecha: "Marzo 2026",
  },
];

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
