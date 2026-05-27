import type { Metadata } from "next";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  CircleX,
  FileText,
  GraduationCap,
  Shield,
  Sparkles,
  Upload,
  UserRound,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Como funciona | Repositorio REDS Colombia",
  description:
    "Guia institucional del repositorio con roles, flujo academico y estados de publicacion.",
};

const sections = [
  { id: "vision", label: "Vision general" },
  { id: "flujo", label: "Flujo academico" },
  { id: "roles", label: "Roles" },
  { id: "estados", label: "Estados" },
  { id: "faq", label: "Preguntas frecuentes" },
];

const flowSteps = [
  {
    title: "El estudiante prepara el recurso",
    text:
      "El estudiante crea un borrador, completa metadatos, adjunta el PDF y decide si guarda avances o envia el recurso a revision.",
  },
  {
    title: "Revision docente",
    text:
      "El docente revisa la publicacion, deja observaciones, solicita ajustes si hace falta o la envia a evaluacion cuando esta lista.",
  },
  {
    title: "Evaluacion formal",
    text:
      "El evaluador inicia la evaluacion, aprueba, rechaza o devuelve con observaciones. Todas las decisiones quedan registradas en la bitacora.",
  },
  {
    title: "Publicacion y control administrativo",
    text:
      "El admin conserva control total: administra usuarios y roles, publica recursos aprobados y puede suspenderlos si el contexto institucional lo exige.",
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
      "Es el autor del recurso. Gestiona sus propios documentos dentro del flujo academico.",
    can: [
      "Subir un recurso en PDF y guardar borradores.",
      "Editar y eliminar sus propios recursos cuando estan en borrador o con ajustes solicitados.",
      "Enviar sus recursos a revision docente.",
      "Ver el estado academico, la visibilidad y las observaciones del recurso.",
    ],
    cannot: [
      "No puede revisar publicaciones de otros usuarios.",
      "No puede evaluar, aprobar, rechazar ni publicar recursos ajenos.",
      "No puede administrar usuarios ni cambiar roles.",
    ],
  },
  {
    title: "Docente",
    icon: GraduationCap,
    color: "text-amber-700",
    border: "border-amber-200",
    background: "bg-amber-50/70",
    summary:
      "Acompana la calidad academica inicial del recurso antes de la evaluacion formal.",
    can: [
      "Ver la cola de revision docente.",
      "Iniciar revision sobre publicaciones enviadas.",
      "Solicitar ajustes con observaciones trazables.",
      "Enviar a evaluacion los recursos listos.",
    ],
    cannot: [
      "No puede administrar usuarios ni cambiar roles.",
      "No puede publicar recursos al sitio publico.",
      "No puede editar el contenido del estudiante directamente.",
    ],
  },
  {
    title: "Evaluador",
    icon: Shield,
    color: "text-violet-700",
    border: "border-violet-200",
    background: "bg-violet-50/70",
    summary:
      "Realiza la evaluacion formal del recurso y deja evidencia academica de la decision.",
    can: [
      "Ver la cola de evaluacion.",
      "Iniciar evaluacion formal.",
      "Aprobar, rechazar o devolver con observaciones.",
      "Consultar la bitacora academica del recurso.",
    ],
    cannot: [
      "No puede administrar usuarios ni cambiar roles.",
      "No puede publicar directamente al sitio publico.",
      "No puede modificar metadatos del estudiante fuera del flujo.",
    ],
  },
  {
    title: "Administrador",
    icon: BadgeCheck,
    color: "text-emerald-700",
    border: "border-emerald-200",
    background: "bg-emerald-50/70",
    summary:
      "Tiene control total sobre usuarios, roles, estados de publicaciones y visibilidad final.",
    can: [
      "Administrar usuarios y roles del sistema.",
      "Ver todas las publicaciones y sus bitacoras.",
      "Publicar recursos aprobados y suspender recursos publicados.",
      "Actuar como respaldo operativo en cualquier etapa del flujo.",
    ],
    cannot: [
      "No tiene restricciones operativas dentro del flujo normal.",
      "Debe mantener trazabilidad y criterio institucional en cada override.",
    ],
  },
];

const states = [
  "borrador",
  "enviada",
  "en_revision_docente",
  "ajustes_solicitados",
  "enviada_a_evaluacion",
  "en_evaluacion",
  "aprobada",
  "rechazada",
  "publicada",
  "suspendida",
];

const faq = [
  {
    question: "Necesito iniciar sesion para explorar publicaciones?",
    answer:
      "No. La consulta publica sigue disponible sin autenticacion. El login solo es necesario para actuar dentro del flujo academico.",
  },
  {
    question: "Que pasa con el rol moderador?",
    answer:
      "Se mantiene solo como compatibilidad temporal. En la operacion academica actual se trata como alias de evaluador, mientras el modelo final visible usa estudiante, docente, evaluador y admin.",
  },
  {
    question: "Quien puede pedir ajustes?",
    answer:
      "El docente durante la revision academica y el evaluador cuando devuelve con observaciones durante la evaluacion formal.",
  },
  {
    question: "Quien publica el recurso al repositorio publico?",
    answer:
      "Solo el admin publica un recurso que ya fue aprobado academicamente.",
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
    <section className={`rounded-3xl border ${border} ${background} p-6 shadow-sm`}>
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
                Guia institucional
              </Badge>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                Como funciona
              </Badge>
            </div>

            <div className="max-w-4xl">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Guia de funcionamiento y roles
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                El repositorio combina consulta publica con un flujo academico real de
                borrador, revision docente, evaluacion formal, aprobacion y publicacion.
              </p>
            </div>

            <section id="vision" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Vision general"
                title="Un repositorio publico con control academico interno"
                description="La exploracion publica se mantiene simple, mientras que la gestion interna usa roles y estados para asegurar trazabilidad, calidad y decisiones realistas."
              />

              <div className="mt-6 rounded-3xl border border-border/70 bg-card/80 p-7 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>
                      Los recursos visibles al publico son los que ya completaron el
                      flujo academico y llegaron al estado <strong>publicada</strong>.
                    </p>
                    <p>
                      Cada cambio de estado registra actor, rol, accion y observaciones
                      para que el estudiante pueda seguir el proceso de su recurso.
                    </p>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>
                      La navegacion cambia segun rol para que cada perfil vea solo las
                      rutas y acciones que realmente necesita.
                    </p>
                    <p>
                      Asi se separan responsabilidades entre autoria, revision,
                      evaluacion y administracion institucional.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="flujo" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Flujo academico"
                title="Como avanza un recurso desde borrador hasta publicacion"
                description="El sistema evita saltos manuales y conduce el recurso por etapas claras, con acciones especificas por rol."
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
                title="Que hace cada perfil y donde actua"
                description="El modelo academico final queda compuesto por estudiante, docente, evaluador y admin. Moderador se conserva solo como compatibilidad temporal."
              />

              <div className="mt-6 space-y-6">
                {roles.map((role) => (
                  <RoleSection key={role.title} {...role} />
                ))}
              </div>
            </section>

            <section id="estados" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Estados"
                title="Estados soportados por el workflow"
                description="Estos estados se reflejan en la base de datos, en los paneles internos y en la bitacora visible de cada recurso."
              />

              <div className="mt-6 rounded-3xl border border-border/70 bg-card/80 p-7 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {states.map((state) => (
                    <div
                      key={state}
                      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground"
                    >
                      <Workflow className="h-4 w-4 text-primary" />
                      <span>{state}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
                  <p className="font-semibold text-foreground">Regla clave</p>
                  <p className="mt-2">
                    El estado academico y la visibilidad publica son capas distintas. Un
                    recurso solo aparece al publico cuando llega a <strong>publicada</strong>.
                  </p>
                </div>
              </div>
            </section>

            <section id="faq" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Preguntas frecuentes"
                title="Dudas comunes sobre el flujo y los permisos"
                description="Estas respuestas resumen la logica operativa actual del repositorio."
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
                    Indice
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">
                    Navegacion rapida
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
                    <span className="text-xs text-muted-foreground/70">-&gt;</span>
                  </a>
                ))}
              </nav>

              <div className="mt-6 rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
                <p className="font-semibold text-foreground">Idea central</p>
                <p className="mt-2">
                  Consulta para explorar, inicia sesion para actuar y deja que cada
                  rol opere dentro de su parte del workflow.
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-border/70 bg-primary/5 p-4 text-sm leading-7 text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Upload className="h-4 w-4 text-primary" />
                  Evidencia visible
                </div>
                <p className="mt-2">
                  El estudiante ve su estado y observaciones. Docente, evaluador y
                  admin ven acciones distintas segun sus permisos.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
