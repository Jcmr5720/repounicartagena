import type { Metadata } from "next";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  CircleX,
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

/* ─── Datos ─────────────────────────────────────────────────────── */

const sections = [
  { id: "vision", label: "Visión general" },
  { id: "flujo", label: "Flujo académico" },
  { id: "roles", label: "Roles" },
  { id: "estados", label: "Estados" },
  { id: "faq", label: "Preguntas frecuentes" },
];

const flowSteps = [
  {
    icon: "01",
    actor: "Docente",
    actorColor: "bg-amber-100 text-amber-700",
    title: "El docente crea el recurso",
    text: "El docente registra la información del recurso, adjunta el PDF y lo deja en borrador hasta terminarlo.",
  },
  {
    icon: "02",
    actor: "Docente",
    actorColor: "bg-amber-100 text-amber-700",
    title: "El docente envía a evaluación",
    text: "Cuando el recurso está listo, el docente lo envía para que pase a revisión académica.",
  },
  {
    icon: "03",
    actor: "Evaluador",
    actorColor: "bg-violet-100 text-violet-700",
    title: "El evaluador decide con rúbrica",
    text: "El evaluador diligencia la rúbrica, asigna puntajes, escribe fortalezas, mejoras y observaciones, y decide desde la misma pantalla.",
  },
  {
    icon: "04",
    actor: "Administrador",
    actorColor: "bg-emerald-100 text-emerald-700",
    title: "El administrador publica al final",
    text: "Si el recurso fue aprobado, el administrador hace la publicación final y puede retirarlo si hace falta.",
  },
];

const roles = [
  {
    title: "Estudiante",
    icon: UserRound,
    accentBg: "bg-sky-50",
    accentBorder: "border-sky-200",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    badgeClass: "bg-sky-100 text-sky-700",
    summary: "Usuario de consulta. Explora el repositorio, revisa detalles y guarda publicaciones favoritas.",
    can: [
      "Explorar publicaciones disponibles.",
      "Ver el detalle de cada recurso publicado.",
      "Agregar y quitar favoritos persistentes.",
    ],
    cannot: [
      "No puede crear publicaciones.",
      "No puede editar, eliminar ni enviar a evaluación.",
      "No puede aprobar, rechazar ni devolver publicaciones.",
    ],
  },
  {
    title: "Docente",
    icon: GraduationCap,
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    badgeClass: "bg-amber-100 text-amber-700",
    summary: "Autor operativo del recurso y responsable de prepararlo antes de la evaluación formal.",
    can: [
      "Crear o subir publicaciones.",
      "Editar sus publicaciones en estados permitidos.",
      "Enviar sus publicaciones a evaluación.",
    ],
    cannot: [
      "No puede evaluar académicamente.",
      "No puede aprobar, rechazar ni devolver con observaciones.",
      "No puede administrar usuarios ni configuración general.",
    ],
  },
  {
    title: "Evaluador",
    icon: Shield,
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-200",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badgeClass: "bg-violet-100 text-violet-700",
    summary: "Conduce la evaluación académica formal desde una sola pantalla.",
    can: [
      "Ver publicaciones enviadas a evaluación.",
      "Diligenciar la rúbrica completa con puntajes y observaciones.",
      "Aprobar, rechazar o devolver con observaciones.",
    ],
    cannot: [
      "No puede crear publicaciones por el docente.",
      "No puede publicar al sitio público final.",
      "No puede administrar usuarios ni roles.",
    ],
  },
  {
    title: "Administrador",
    icon: BadgeCheck,
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeClass: "bg-emerald-100 text-emerald-700",
    summary: "Tiene control total y conserva la publicación final pública.",
    can: [
      "Gestionar usuarios y roles.",
      "Intervenir en publicaciones y estados.",
      "Publicar recursos aprobados y suspenderlos si hace falta.",
    ],
    cannot: [
      "No tiene restricciones operativas dentro del sistema.",
      "Debe mantener trazabilidad institucional en cada intervención.",
    ],
  },
];

const states: { key: string; label: string; color: string; dot: string }[] = [
  { key: "borrador",              label: "Borrador",               color: "bg-stone-100 text-stone-600 border-stone-200",    dot: "bg-stone-400" },
  { key: "enviada",               label: "Enviada",                color: "bg-blue-50  text-blue-600  border-blue-200",     dot: "bg-blue-500" },
  { key: "en_evaluacion",         label: "En evaluación",          color: "bg-violet-50 text-violet-600 border-violet-200", dot: "bg-violet-500" },
  { key: "ajustes_solicitados",   label: "Ajustes solicitados",    color: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500" },
  { key: "aprobada",              label: "Aprobada",               color: "bg-lime-50   text-lime-700   border-lime-200",   dot: "bg-lime-500" },
  { key: "rechazada",             label: "Rechazada",              color: "bg-red-50    text-red-600    border-red-200",    dot: "bg-red-500" },
  { key: "publicada",             label: "Publicada",              color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  { key: "suspendida",            label: "Suspendida",             color: "bg-zinc-100  text-zinc-500   border-zinc-200",  dot: "bg-zinc-400" },
];

const faq = [
  {
    question: "¿Necesito iniciar sesión para explorar publicaciones?",
    answer: "No. La consulta pública sigue disponible sin autenticación. El inicio de sesión solo es necesario para guardar favoritos o actuar dentro del flujo.",
  },
  {
    question: "¿Quién puede crear publicaciones?",
    answer: "El docente es el autor operativo del flujo. El administrador conserva capacidad de respaldo general.",
  },
  {
    question: "¿Quién toma la decisión académica?",
    answer: "El evaluador. Debe registrar la evaluación completa antes de aprobar, rechazar o devolver con observaciones.",
  },
  {
    question: "¿Quién publica el recurso al repositorio público?",
    answer: "El administrador mantiene la publicación final de los recursos aprobados.",
  },
];

/* ─── Subcomponentes ─────────────────────────────────────────────── */

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function RoleCard({
  title, icon: Icon, accentBg, accentBorder, iconBg, iconColor, badgeClass, summary, can, cannot,
}: (typeof roles)[number]) {
  return (
    <div className={`overflow-hidden rounded-3xl border ${accentBorder} ${accentBg} shadow-sm`}>
      {/* Encabezado */}
      <div className="flex items-center gap-4 px-6 pt-6 pb-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <div className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
            {title}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
      </div>

      {/* Columnas puede / no puede */}
      <div className="grid gap-0 divide-y divide-border/40 bg-background/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Puede hacer
          </p>
          <ul className="space-y-2.5">
            {can.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            No puede hacer
          </p>
          <ul className="space-y-2.5">
            {cannot.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── Página ─────────────────────────────────────────────────────── */

export default function Page() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_top_left,_rgba(99,102,241,0.06),_transparent),radial-gradient(ellipse_60%_40%_at_bottom_right,_rgba(245,158,11,0.07),_transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_268px]">

          {/* ══════════════════════════════════════
              MAIN
          ══════════════════════════════════════ */}
          <main className="min-w-0">

            {/* Hero */}
            <div className="mb-12">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Guía institucional
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Cómo funciona
                </Badge>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Guía de funcionamiento y roles
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                El repositorio combina consulta pública, favoritos, gestión docente del recurso,
                evaluación formal y control administrativo final.
              </p>

            </div>

            {/* ── Visión general ── */}
            <section id="vision" className="scroll-mt-24">
              <SectionHeading
                eyebrow="Visión general"
                title="Consulta pública con control académico real"
                description="La exploración pública se mantiene simple, mientras que la gestión interna separa con claridad quién crea, quién evalúa y quién publica."
              />

              <div className="mt-6 grid gap-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm sm:grid-cols-2">
                {[
                  "Los recursos visibles al público son los que ya completaron la evaluación y fueron publicados por administración.",
                  "El estudiante queda orientado a consulta, detalle y favoritos, sin intervenir en la creación o envío del recurso.",
                  "El docente es el autor operativo del proceso y el evaluador registra la decisión académica desde una única pantalla.",
                  "Los usuarios autenticados pueden construir una lista de favoritos para volver rápido a publicaciones de interés.",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3 text-sm leading-7 text-muted-foreground">
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-primary/60" />
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Flujo académico — Timeline ── */}
            <section id="flujo" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Flujo académico"
                title="Cómo avanza un recurso hasta quedar publicado"
                description="El sistema evita atajos manuales y obliga a que la evaluación quede completa antes de cualquier decisión."
              />

              <div className="relative mt-8">
                {/* Línea vertical del timeline */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border/60 sm:left-6" />

                <div className="space-y-6">
                  {flowSteps.map((step) => (
                    <div key={step.title} className="relative flex items-start gap-5 sm:gap-6">
                      {/* Número / nodo */}
                      <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-border/60 bg-background font-bold text-sm text-primary shadow-sm">
                        {step.icon}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${step.actorColor}`}>
                            {step.actor}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Roles ── */}
            <section id="roles" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Roles"
                title="Qué hace cada perfil"
                description="El flujo oficial queda compuesto por estudiante, docente, evaluador y administrador."
              />

              <div className="mt-6 space-y-5">
                {roles.map((role) => (
                  <RoleCard key={role.title} {...role} />
                ))}
              </div>
            </section>

            {/* ── Estados ── */}
            <section id="estados" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Estados"
                title="Estados soportados por el workflow"
                description="Estos estados se reflejan en la interfaz y en la bitácora histórica de cada publicación."
              />

              <div className="mt-6 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {states.map(({ key, label, color, dot }) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${color}`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                      {label}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
                  <Workflow className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p>
                    <span className="font-semibold">Regla clave:</span> La evaluación formal no equivale
                    a publicación pública. Un recurso aprobado todavía requiere la acción final de
                    administración para pasar a <strong>publicada</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="mt-16 scroll-mt-24">
              <SectionHeading
                eyebrow="Preguntas frecuentes"
                title="Dudas comunes"
                description="Estas respuestas resumen la lógica operativa actual del repositorio."
              />

              <div className="mt-6 space-y-3">
                {faq.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-border/60 bg-background/90 shadow-sm open:border-primary/20 open:bg-primary/[0.02]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CircleHelp className="h-5 w-5 shrink-0 text-primary/70" />
                        <span className="text-sm font-semibold text-foreground">{item.question}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                    </summary>
                    <div className="px-5 pb-4 pt-0">
                      <div className="ml-8 border-l-2 border-primary/20 pl-4">
                        <p className="text-sm leading-7 text-muted-foreground">{item.answer}</p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </main>

          {/* ══════════════════════════════════════
              SIDEBAR
          ══════════════════════════════════════ */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-3xl border border-border/60 bg-card/90 p-5 shadow-sm">
              {/* Navegación */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Índice</p>
                  <p className="text-sm font-semibold text-foreground leading-tight">Navegación rápida</p>
                </div>
              </div>

              <nav className="space-y-1">
                {sections.map((section, i) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted/50 hover:text-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                        {i + 1}
                      </span>
                      {section.label}
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                ))}
              </nav>

              {/* Mini resumen de roles */}
              <div className="mt-4 rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Roles del sistema
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Estudiante", color: "bg-sky-500" },
                    { label: "Docente", color: "bg-amber-500" },
                    { label: "Evaluador", color: "bg-violet-500" },
                    { label: "Administrador", color: "bg-emerald-500" },
                  ].map(({ label, color }) => (
                    <a
                      key={label}
                      href="#roles"
                      className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className={`h-2 w-2 rounded-full ${color}`} />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
