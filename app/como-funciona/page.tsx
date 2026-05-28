import type { Metadata } from "next";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  CircleX,
  FileHeart,
  FileText,
  GraduationCap,
  Shield,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Como funciona | Repositorio REDS Colombia",
  description:
    "Guia clara del repositorio con roles, flujo de publicacion, evaluacion formal y favoritos.",
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
    title: "El docente crea el recurso",
    text:
      "El docente registra la informacion del recurso, adjunta el PDF y lo deja en borrador hasta terminarlo.",
  },
  {
    title: "El docente envia a evaluacion",
    text:
      "Cuando el recurso esta listo, el docente lo envia para que pase a revision academica.",
  },
  {
    title: "El evaluador decide con rubrica",
    text:
      "El evaluador diligencia la rubrica, asigna puntajes, escribe fortalezas, mejoras y observaciones, y decide desde la misma pantalla.",
  },
  {
    title: "El administrador publica al final",
    text:
      "Si el recurso fue aprobado, el administrador hace la publicacion final y puede retirarlo si hace falta.",
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
      "Es un usuario de consulta. Explora el repositorio, revisa detalles y guarda publicaciones favoritas.",
    can: [
      "Explorar publicaciones disponibles.",
      "Ver el detalle de cada recurso publicado.",
      "Agregar y quitar favoritos persistentes.",
    ],
    cannot: [
      "No puede crear publicaciones.",
      "No puede editar, eliminar ni enviar publicaciones a evaluacion.",
      "No puede aprobar, rechazar ni devolver publicaciones.",
    ],
  },
  {
    title: "Docente",
    icon: GraduationCap,
    color: "text-amber-700",
    border: "border-amber-200",
    background: "bg-amber-50/70",
    summary:
      "Es el autor operativo del recurso y el responsable de prepararlo antes de la evaluacion formal.",
    can: [
      "Crear o subir publicaciones.",
      "Editar sus publicaciones en estados permitidos.",
      "Enviar sus publicaciones a evaluacion.",
    ],
    cannot: [
      "No puede evaluar academicamente.",
      "No puede aprobar, rechazar ni devolver con observaciones.",
      "No puede administrar usuarios ni configuracion general.",
    ],
  },
  {
    title: "Evaluador",
    icon: Shield,
    color: "text-violet-700",
    border: "border-violet-200",
    background: "bg-violet-50/70",
    summary:
      "Conduce la evaluacion academica formal desde una sola pantalla.",
    can: [
      "Ver publicaciones enviadas a evaluacion.",
      "Diligenciar la rubrica completa con puntajes, fortalezas, mejoras y observaciones.",
      "Aprobar, rechazar o devolver con observaciones.",
    ],
    cannot: [
      "No puede crear publicaciones por el docente.",
      "No puede publicar al sitio publico final.",
      "No puede administrar usuarios ni roles.",
    ],
  },
  {
    title: "Administrador",
    icon: BadgeCheck,
    color: "text-emerald-700",
    border: "border-emerald-200",
    background: "bg-emerald-50/70",
    summary:
      "Tiene control total y conserva la publicacion final publica.",
    can: [
      "Gestionar usuarios y roles.",
      "Intervenir en publicaciones y estados.",
      "Publicar recursos aprobados y suspenderlos si hace falta.",
    ],
    cannot: [
      "No tiene restricciones operativas dentro del sistema.",
      "Debe mantener trazabilidad institucional en cada override.",
    ],
  },
];

const states = [
  "borrador",
  "enviada",
  "en_evaluacion",
  "ajustes_solicitados",
  "aprobada",
  "rechazada",
  "publicada",
  "suspendida",
];

const faq = [
  {
    question: "Necesito iniciar sesion para explorar publicaciones?",
    answer:
      "No. La consulta publica sigue disponible sin autenticacion. El inicio de sesion solo es necesario para guardar favoritos o actuar dentro del flujo.",
  },
  {
    question: "Quien puede crear publicaciones?",
    answer:
      "El docente es el autor operativo del flujo y el administrador conserva capacidad de respaldo general.",
  },
  {
    question: "Quien toma la decision academica?",
    answer:
      "El evaluador. Debe registrar la evaluacion completa antes de aprobar, rechazar o devolver con observaciones.",
  },
  {
    question: "Quien publica el recurso al repositorio publico?",
    answer:
      "El administrador mantiene la publicacion final de los recursos aprobados.",
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
                El repositorio combina consulta publica, favoritos, gestion
                docente del recurso, evaluacion formal y control administrativo
                final.
              </p>
            </div>

            <section id="vision" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Vision general"
                title="Consulta publica con control academico real"
                description="La exploracion publica se mantiene simple, mientras que la gestion interna separa con claridad quien crea, quien evalua y quien publica."
              />

              <div className="mt-6 rounded-3xl border border-border/70 bg-card/80 p-7 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>
                      Los recursos visibles al publico son los que ya completaron la
                      evaluacion y fueron publicados por administracion.
                    </p>
                    <p>
                      El estudiante queda orientado a consulta, detalle y
                      favoritos, sin intervenir en la creacion o envio del recurso.
                    </p>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>
                      El docente es el autor operativo del proceso y el evaluador
                      registra la decision academica desde una unica pantalla.
                    </p>
                    <p>
                      Ademas, los usuarios autenticados pueden construir una lista de
                      favoritos para volver rapido a publicaciones de interes.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="flujo" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Flujo academico"
                title="Como avanza un recurso hasta quedar publicado"
                description="El sistema evita atajos manuales y obliga a que la evaluacion quede completa antes de cualquier decision."
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
                title="Que hace cada perfil"
                description="El flujo oficial queda compuesto por estudiante, docente, evaluador y administrador."
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
                description="Estos estados se reflejan en la interfaz y en la bitacora historica de cada publicacion."
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
                    La evaluacion formal no equivale a publicacion publica. Un recurso
                    aprobado todavia requiere la accion final de administracion para
                    pasar a <strong>publicada</strong>.
                  </p>
                </div>
              </div>
            </section>

            <section id="faq" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Preguntas frecuentes"
                title="Dudas comunes"
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

              <div className="mt-6 rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileHeart className="h-4 w-4 text-rose-600" />
                  Favoritos persistentes
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Los usuarios autenticados pueden guardar publicaciones y
                  encontrarlas luego desde el corazon del encabezado.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
