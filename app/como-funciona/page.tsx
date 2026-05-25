import type { Metadata } from "next";
import {
  BadgeCheck,
  BookOpen,
  CircleHelp,
  CircleX,
  Eye,
  FileText,
  Lock,
  Shield,
  Sparkles,
  UserRound,
  Workflow,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Cómo funciona | Repositorio REDS Colombia",
  description:
    "Guía institucional del repositorio: funcionamiento general, roles, permisos y acciones disponibles.",
};

const sections = [
  { id: "vision", label: "Visión general" },
  { id: "flujo", label: "Flujo de uso" },
  { id: "roles", label: "Roles" },
  { id: "acciones", label: "Acciones principales" },
  { id: "faq", label: "Preguntas frecuentes" },
];

const flowSteps = [
  {
    title: "Explorar",
    text:
      "La primera experiencia es pública. Cualquier persona puede navegar publicaciones, leer su información visible y revisar el detalle de los recursos publicados.",
  },
  {
    title: "Iniciar sesión solo cuando sea necesario",
    text:
      "La autenticación aparece cuando el usuario necesita publicar, editar o moderar contenido. Para consultar no se exige ingreso al sistema.",
  },
  {
    title: "Trabajar según el rol",
    text:
      "Cada cuenta recibe permisos concretos. El sistema separa las tareas para evitar cruces innecesarios y mantener la administración ordenada.",
  },
  {
    title: "Controlar el estado del documento",
    text:
      "Las publicaciones pueden estar disponibles o suspendidas. Ese estado define si aparecen en la vista pública o si permanecen solo para gestión interna.",
  },
];

const roles = [
  {
    title: "Estudiante",
    icon: UserRound,
    color: "text-sky-700",
    border: "border-sky-200",
    background: "bg-sky-50/70",
    summary:
      "Es el rol base de la plataforma. Publica sus propios documentos y administra únicamente lo que le pertenece.",
    can: [
      "Subir documentos en PDF.",
      "Editar la información de sus propios documentos cuando están disponibles.",
      "Eliminar sus propios documentos cuando están disponibles.",
      "Explorar y consultar los documentos publicados por la comunidad.",
      "Buscar y filtrar publicaciones desde las vistas públicas.",
    ],
    cannot: [
      "No puede suspender ni reactivar documentos.",
      "No puede editar ni eliminar documentos de otras personas.",
      "No puede administrar usuarios ni modificar roles.",
      "No puede acceder a la vista de moderación ni a la vista unificada de gestión.",
    ],
  },
  {
    title: "Moderador",
    icon: Shield,
    color: "text-amber-700",
    border: "border-amber-200",
    background: "bg-amber-50/70",
    summary:
      "Supervisa el estado de las publicaciones y mantiene el contenido visible dentro de las reglas del repositorio.",
    can: [
      "Ver todas las publicaciones del sistema.",
      "Suspender publicaciones que no deban estar visibles.",
      "Reactivar publicaciones suspendidas cuando corresponda.",
      "Usar la vista unificada para buscar, filtrar y revisar documentos.",
      "Abrir el detalle y descargar PDFs públicos cuando estén disponibles.",
    ],
    cannot: [
      "No puede editar el contenido ni los metadatos de una publicación.",
      "No puede eliminar publicaciones.",
      "No puede crear, editar o eliminar usuarios.",
      "No puede cambiar roles de otros usuarios.",
    ],
  },
  {
    title: "Admin",
    icon: BadgeCheck,
    color: "text-emerald-700",
    border: "border-emerald-200",
    background: "bg-emerald-50/70",
    summary:
      "Tiene control total sobre el repositorio: publicaciones, usuarios, roles y moderación general del sistema.",
    can: [
      "Ver todas las publicaciones.",
      "Editar cualquier publicación.",
      "Eliminar cualquier publicación.",
      "Suspender y reactivar publicaciones.",
      "Administrar usuarios y cambiar roles.",
      "Acceder a todas las vistas internas del sistema.",
    ],
    cannot: [
      "No tiene restricciones operativas dentro del flujo normal del repositorio.",
      "Debe seguir la política institucional de uso y gestión del contenido.",
    ],
  },
];

const actions = [
  {
    icon: Upload,
    title: "Publicar",
    text:
      "La publicación la realiza un usuario autenticado que dispone de permisos de carga. El sistema solicita la información necesaria, valida el archivo y deja el documento disponible para consulta cuando cumple las reglas de visibilidad.",
  },
  {
    icon: Eye,
    title: "Consultar",
    text:
      "Cualquier visitante puede buscar, filtrar y abrir documentos visibles. Esta capa pública está pensada para lectura y revisión, no para edición ni moderación.",
  },
  {
    icon: Workflow,
    title: "Gestionar",
    text:
      "La vista unificada agrupa búsqueda, filtros y acciones internas. Allí moderadores y administradores trabajan sobre el conjunto completo de publicaciones sin duplicar pantallas.",
  },
  {
    icon: Lock,
    title: "Restringir",
    text:
      "Cuando una publicación se suspende, deja de mostrarse en la parte pública. Sigue existiendo en el sistema para que un moderador o un admin decidan si debe reactivarse o retirarse definitivamente.",
  },
];

const faq = [
  {
    question: "¿Necesito iniciar sesión para explorar publicaciones?",
    answer:
      "No. La exploración y consulta pública están disponibles sin autenticación. Solo las acciones de subida y gestión requieren sesión.",
  },
  {
    question: "¿Qué significa que un documento esté suspendido?",
    answer:
      "Que no debe aparecer en la vista pública de exploración. El documento sigue existiendo en el sistema y puede ser reactivado por un moderador o un admin.",
  },
  {
    question: "¿Puedo editar una publicación que no sea mía?",
    answer:
      "No. La edición de documentos propios está reservada al estudiante dueño del contenido o al admin, según las reglas configuradas.",
  },
  {
    question: "¿Dónde hago las acciones de gestión?",
    answer:
      "Desde la vista unificada de gestión de publicaciones, que concentra búsqueda, filtros y acciones por rol.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary/80">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function RoleSection({
  title,
  icon: Icon,
  color,
  border,
  background,
  summary,
  can,
  cannot,
}: {
  title: string;
  icon: typeof UserRound;
  color: string;
  border: string;
  background: string;
  summary: string;
  can: string[];
  cannot: string[];
}) {
  return (
    <section
      className={`rounded-3xl border ${border} ${background} p-6 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <div className={`rounded-2xl bg-background p-3 shadow-sm ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">
            Puede hacer
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-foreground/90">
            {can.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">
            No puede hacer
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-foreground/90">
            {cannot.map((item) => (
              <li key={item} className="flex gap-3">
                <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <main>
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Guía institucional
              </Badge>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                Cómo funciona
              </Badge>
            </div>

            <div className="max-w-4xl">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Guía de funcionamiento y roles
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                Esta página explica de manera extensa cómo funciona el repositorio,
                qué puede hacer cada rol y qué acciones están permitidas o restringidas.
                La idea es que cualquier usuario entienda la lógica de uso sin tener
                que adivinar dónde se encuentra cada función.
              </p>
            </div>

            <section id="vision" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Visión general"
                title="Qué es el repositorio y cómo se usa"
                description="El repositorio centraliza recursos digitales académicos. Los usuarios pueden consultarlos públicamente, mientras que la creación y la gestión están reservadas a roles internos con permisos específicos."
              />

              <div className="mt-6 rounded-3xl border border-border/70 bg-card/80 p-7 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>
                      La experiencia pública está pensada para explorar y consultar.
                      La experiencia interna está pensada para administrar contenido,
                      corregir estados y mantener el repositorio ordenado.
                    </p>
                    <p>
                      Un documento puede estar disponible o suspendido. Cuando está
                      suspendido, deja de aparecer en la exploración general, aunque sigue
                      existiendo en el sistema para tareas de moderación o administración.
                    </p>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>
                      Los roles no se crean para complicar el uso, sino para separar
                      responsabilidades: cada persona ve solo lo que necesita para trabajar
                      bien y con seguridad.
                    </p>
                    <p>
                      Así se evita que una acción operativa, como editar o suspender, termine
                      en manos de un perfil que solo debe consultar o publicar contenido propio.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="flujo" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Flujo de uso"
                title="Cómo se recorre la plataforma paso a paso"
                description="La secuencia de trabajo es simple: consultar, autenticarse cuando sea necesario, actuar según el rol y controlar el estado de cada documento."
              />

              <div className="mt-6 space-y-4">
                {flowSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="roles" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Roles"
                title="Qué hace cada perfil y qué no puede hacer"
                description="Cada rol tiene un alcance distinto. Esa separación permite controlar el contenido, proteger los datos y mantener el repositorio operable sin mezclar responsabilidades."
              />

              <div className="mt-6 space-y-6">
                {roles.map((role) => (
                  <RoleSection key={role.title} {...role} />
                ))}
              </div>
            </section>

            <section id="acciones" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Acciones principales"
                title="Cómo se publica, consulta, gestiona y restringe"
                description="Las funciones principales están distribuidas para que la experiencia sea clara: publicar para quien aporta contenido, consultar para quien navega y gestionar para quien administra el sistema."
              />

              <div className="mt-6 grid gap-4">
                {actions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <div
                      key={action.title}
                      className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {action.title}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            {action.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="faq" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Preguntas frecuentes"
                title="Dudas comunes sobre uso y permisos"
                description="Estas respuestas resumen las reglas básicas de la plataforma y ayudan a entender qué esperar de cada vista y cada rol."
              />

              <div className="mt-6 space-y-4">
                {faq.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 text-base font-semibold text-foreground">
                      <CircleHelp className="h-5 w-5 shrink-0 text-primary" />
                      <span>{item.question}</span>
                    </summary>
                    <p className="mt-4 pl-8 text-sm leading-7 text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </main>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Índice
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">
                    Navegación rápida
                  </h2>
                </div>
              </div>

              <nav className="mt-6 space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
                  >
                    <span>{section.label}</span>
                    <span className="text-xs text-muted-foreground/70">→</span>
                  </a>
                ))}
              </nav>

              <div className="mt-6 rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
                <p className="font-semibold text-foreground">Idea central</p>
                <p className="mt-2">
                  Consulta para explorar, autentícate para actuar y usa cada rol solo
                  dentro de su alcance.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
