"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  History,
  Search,
  ShieldAlert,
  Sparkles,
  Undo2,
  XCircle,
} from "lucide-react";
import { EvaluationForm } from "@/components/evaluation-form";
import { PublicationDetailModal } from "@/components/publication-detail-modal";
import { PublicationWorkflowActionDialog } from "@/components/publication-workflow-action-dialog";
import { PublicationWorkflowTimeline } from "@/components/publication-workflow-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import {
  canAccessEvaluation,
  canPublishPublication,
  canSuspendPublication,
  isAdmin,
} from "@/lib/permissions";
import { usePublications } from "@/lib/publications-context";
import {
  EVALUATION_DECISION_LABELS,
  PUBLICATION_WORKFLOW_STATUS_LABELS,
  type EvaluationDecision,
  type Publication,
  type PublicationEvaluation,
  type PublicationEvaluationInput,
  type PublicationWorkflowAction,
} from "@/lib/types";

function formatLongDate(value?: string | null) {
  if (!value) return "No registrada";
  return new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* Badge de estado con color semántico */
function WorkflowStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    borrador:             "bg-stone-100 text-stone-600 border-stone-200",
    enviada:              "bg-blue-50 text-blue-700 border-blue-200",
    en_evaluacion:        "bg-violet-50 text-violet-700 border-violet-200",
    ajustes_solicitados:  "bg-orange-50 text-orange-700 border-orange-200",
    aprobada:             "bg-lime-50 text-lime-700 border-lime-200",
    rechazada:            "bg-red-50 text-red-600 border-red-200",
    publicada:            "bg-emerald-50 text-emerald-700 border-emerald-200",
    suspendida:           "bg-zinc-100 text-zinc-500 border-zinc-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {PUBLICATION_WORKFLOW_STATUS_LABELS[status as keyof typeof PUBLICATION_WORKFLOW_STATUS_LABELS] ?? status}
    </span>
  );
}

export function PublicationManagementPage() {
  const { user, isLoading } = useAuth();
  const {
    applyWorkflowAction,
    evaluations,
    getLatestEvaluationForPublication,
    getWorkflowEventsForPublication,
    publications,
    savePublicationEvaluation,
    isLoading: publicationsLoading,
  } = usePublications();

  const [searchQuery, setSearchQuery]       = useState("");
  const [detailPublication, setDetailPublication]   = useState<Publication | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedAction, setSelectedAction] = useState<PublicationWorkflowAction | null>(null);
  const [comments, setComments]             = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [expandedEval, setExpandedEval]     = useState<string | null>(null);
  const [feedback, setFeedback]             = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const evaluationQueue = useMemo(() => {
    return publications.filter((p) => {
      const inQueue = ["enviada","en_evaluacion","aprobada","rechazada","publicada","suspendida","ajustes_solicitados"].includes(p.workflow_status);
      const matchesQuery = !normalizedQuery ||
        p.titulo.toLowerCase().includes(normalizedQuery) ||
        p.autor.toLowerCase().includes(normalizedQuery) ||
        p.programa.toLowerCase().includes(normalizedQuery) ||
        (p.owner_name ?? "").toLowerCase().includes(normalizedQuery) ||
        (p.owner_username ?? "").toLowerCase().includes(normalizedQuery);
      return inQueue && matchesQuery;
    });
  }, [normalizedQuery, publications]);

  const counts = useMemo(() => ({
    pending:    publications.filter((p) => p.workflow_status === "enviada").length,
    inProgress: publications.filter((p) => p.workflow_status === "en_evaluacion").length,
    approved:   publications.filter((p) => p.workflow_status === "aprobada").length,
    published:  publications.filter((p) => p.workflow_status === "publicada").length,
  }), [publications]);

  const evaluatorHistory = useMemo(() => {
    if (!user || isAdmin(user)) return [] as Array<{ publication: Publication; evaluation: PublicationEvaluation }>;

    const latest = new Map<string, PublicationEvaluation>();
    evaluations
      .filter((e) => e.evaluator_id === user.id)
      .forEach((e) => {
        const cur = latest.get(e.publication_id);
        if (!cur) { latest.set(e.publication_id, e); return; }
        const curT = cur.evaluated_at ?? cur.updated_at ?? cur.created_at;
        const nxtT = e.evaluated_at ?? e.updated_at ?? e.created_at;
        if (new Date(nxtT).getTime() >= new Date(curT).getTime()) latest.set(e.publication_id, e);
      });

    return Array.from(latest.values())
      .map((e) => ({ evaluation: e, publication: publications.find((p) => p.id === e.publication_id) }))
      .filter((item): item is { publication: Publication; evaluation: PublicationEvaluation } => !!item.publication)
      .sort((a, b) => {
        const aT = a.evaluation.evaluated_at ?? a.evaluation.updated_at ?? a.evaluation.created_at;
        const bT = b.evaluation.evaluated_at ?? b.evaluation.updated_at ?? b.evaluation.created_at;
        return new Date(bT).getTime() - new Date(aT).getTime();
      });
  }, [evaluations, publications, user]);

  if (isLoading || publicationsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-4">
        {[1,2,3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    );
  }

  if (!user || !(canAccessEvaluation(user) || isAdmin(user))) {
    return (
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_30%)]" />
        <div className="relative mx-auto max-w-lg px-4 py-24 sm:px-6 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Acceso restringido</h1>
          <p className="mt-3 text-muted-foreground">Esta vista está reservada para evaluadores y administradores.</p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/explorar"><ArrowLeft className="mr-2 h-4 w-4" />Volver a explorar</Link>
          </Button>
        </div>
      </div>
    );
  }

  const openActionDialog = (publication: Publication, action: PublicationWorkflowAction) => {
    setSelectedPublication(publication);
    setSelectedAction(action);
    setComments("");
  };

  const closeActionDialog = () => {
    setSelectedPublication(null);
    setSelectedAction(null);
    setComments("");
    setIsSubmittingAction(false);
  };

  const handleWorkflowAction = async (publicationId: string, action: PublicationWorkflowAction, actionComments?: string) => {
    setFeedback(null);
    const result = await applyWorkflowAction(publicationId, action, actionComments);
    if (!result.success) {
      setFeedback({ kind: "error", message: result.error || "No se pudo ejecutar la acción del flujo." });
      return false;
    }
    setFeedback({ kind: "success", message: "La acción del flujo académico se ejecutó correctamente." });
    return true;
  };

  const ensureEvaluationStarted = async (publicationId: string) => {
    const pub = publications.find((p) => p.id === publicationId);
    if (!pub || pub.workflow_status !== "enviada") return { success: true };
    return applyWorkflowAction(publicationId, "start_evaluation");
  };

  const handleConfirmAction = async () => {
    if (!selectedPublication || !selectedAction) return;
    setIsSubmittingAction(true);
    const success = await handleWorkflowAction(selectedPublication.id, selectedAction, comments);
    if (success) { closeActionDialog(); return; }
    setIsSubmittingAction(false);
  };

  const handleSaveEvaluation = async (input: PublicationEvaluationInput) => {
    const startResult = await ensureEvaluationStarted(input.publication_id);
    if (!startResult.success) return startResult;
    return savePublicationEvaluation(input);
  };

  const handleEvaluationDecision = async (input: PublicationEvaluationInput, action: EvaluationDecision) => {
    const startResult = await ensureEvaluationStarted(input.publication_id);
    if (!startResult.success) return startResult;

    const saveResult = await savePublicationEvaluation({ ...input, decision: action });
    if (!saveResult.success) return saveResult;

    const workflowAction: PublicationWorkflowAction =
      action === "approve" ? "approve" : action === "reject" ? "reject" : "return_with_observations";

    const transitionResult = await applyWorkflowAction(input.publication_id, workflowAction, input.comments);
    if (!transitionResult.success) return transitionResult;

    setFeedback({ kind: "success", message: `La decisión ${EVALUATION_DECISION_LABELS[action].toLowerCase()} quedó registrada y el flujo avanzó correctamente.` });
    return { success: true };
  };

  const dialogMap: Partial<Record<PublicationWorkflowAction, { title: string; description: string; confirmLabel: string; requireComments: boolean }>> = {
    publish: { title: "Publicar recurso", description: "Confirma que la publicación aprobada quedará visible al público.", confirmLabel: "Publicar", requireComments: false },
    suspend: { title: "Suspender recurso", description: "Deja evidencia de la razón por la que se retira de la vista pública.", confirmLabel: "Suspender", requireComments: true },
  };

  /* ─── Estadísticas con color semántico ─── */
  const statCards = [
    { label: "Enviadas",      value: counts.pending,    dot: "bg-blue-500",    ring: "ring-blue-100" },
    { label: "En evaluación", value: counts.inProgress, dot: "bg-violet-500",  ring: "ring-violet-100" },
    { label: "Aprobadas",     value: counts.approved,   dot: "bg-lime-500",    ring: "ring-lime-100" },
    { label: "Publicadas",    value: counts.published,  dot: "bg-emerald-500", ring: "ring-emerald-100" },
  ];

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_top_left,_rgba(99,102,241,0.06),_transparent),radial-gradient(ellipse_50%_35%_at_bottom_right,_rgba(245,158,11,0.06),_transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ── Encabezado ── */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Evaluación y control
              </Badge>
              <Badge variant="outline">{isAdmin(user) ? "Administrador" : "Evaluador"}</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Gestión de REDS
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
              Revisa el recurso completo, evalúa con la rúbrica y aplica decisiones del flujo académico.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="shrink-0 gap-2">
              <Link href="/subir">
                Ir a subir recurso
              </Link>
            </Button>
            <Button asChild variant="outline" className="shrink-0 gap-2">
              <Link href={isAdmin(user) ? "/admin" : "/explorar"}>
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Feedback global ── */}
        {feedback && (
          <div className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-destructive/20 bg-destructive/8 text-destructive"
          }`}>
            {feedback.kind === "success"
              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
              : <XCircle className="h-4 w-4 shrink-0" />}
            {feedback.message}
          </div>
        )}

        {/* ── Tarjetas de estadísticas ── */}
        <div className="mb-8 grid gap-3 grid-cols-2 md:grid-cols-4">
          {statCards.map(({ label, value, dot, ring }) => (
            <div key={label} className={`rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-2 ${ring}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Buscador ── */}
        <div className="mb-6 relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, autor, programa o docente…"
            className="h-11 pl-10 bg-background border-border/60 focus:border-primary/40"
          />
        </div>

        {/* ── Cola operativa ── */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Cola operativa</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">Publicaciones por revisar</h2>
            </div>
            {evaluationQueue.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {evaluationQueue.length} {evaluationQueue.length === 1 ? "publicación" : "publicaciones"}
              </Badge>
            )}
          </div>

          {evaluationQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
              <p className="text-sm font-medium text-foreground">Cola vacía</p>
              <p className="mt-1 text-sm text-muted-foreground">No hay publicaciones en la cola de evaluación.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluationQueue.map((publication) => {
                const latestEvaluation = getLatestEvaluationForPublication(publication.id);
                const canEvaluate = ["enviada", "en_evaluacion"].includes(publication.workflow_status);
                const isEvalExpanded = expandedEval === publication.id;

                return (
                  <div key={publication.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">

                    {/* Franja de color por estado */}
                    <div className={`h-1 w-full ${
                      publication.workflow_status === "publicada"    ? "bg-emerald-500" :
                      publication.workflow_status === "aprobada"     ? "bg-lime-500" :
                      publication.workflow_status === "rechazada"    ? "bg-red-500" :
                      publication.workflow_status === "en_evaluacion"? "bg-violet-500" :
                      publication.workflow_status === "enviada"      ? "bg-blue-500" :
                      publication.workflow_status === "ajustes_solicitados" ? "bg-orange-500" :
                      "bg-border"
                    }`} />

                    <div className="p-5">
                      {/* Cabecera de la tarjeta */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <WorkflowStatusBadge status={publication.workflow_status} />
                            <Badge variant="secondary" className="text-xs">{publication.programa}</Badge>
                            {latestEvaluation?.total_score != null && (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                                {latestEvaluation.total_score}/20
                              </Badge>
                            )}
                            {latestEvaluation?.decision && (
                              <Badge variant="outline" className="text-xs">
                                {EVALUATION_DECISION_LABELS[latestEvaluation.decision]}
                              </Badge>
                            )}
                          </div>
                          <h2 className="text-lg font-semibold leading-snug text-foreground">
                            {publication.titulo}
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {publication.autor}
                            <span className="mx-1.5 text-border">·</span>
                            Subido por {publication.owner_name || publication.owner_username || "No disponible"}
                          </p>
                        </div>

                        {/* Acciones principales */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setDetailPublication(publication)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver completa
                          </Button>
                          {canEvaluate && (
                            <Button
                              type="button"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setExpandedEval(isEvalExpanded ? null : publication.id)}
                            >
                              <ClipboardCheck className="h-3.5 w-3.5" />
                              {isEvalExpanded ? "Cerrar rúbrica" : "Evaluar"}
                            </Button>
                          )}
                          {canPublishPublication(user, publication) && (
                            <Button
                              type="button"
                              size="sm"
                              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                              onClick={() => openActionDialog(publication, "publish")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Publicar
                            </Button>
                          )}
                          {canSuspendPublication(user, publication) && (
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="gap-1.5"
                              onClick={() => openActionDialog(publication, "suspend")}
                            >
                              <Undo2 className="h-3.5 w-3.5" />
                              Suspender
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Resumen */}
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {publication.resumen}
                      </p>

                      {/* Info rápida: estado evaluación + bitácora */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {/* Último estado académico */}
                        <div className="rounded-xl border border-border/50 bg-muted/30 p-3.5 text-sm">
                          <p className="mb-2 font-medium text-foreground">Último estado académico</p>
                          {latestEvaluation ? (
                            <div className="space-y-1 text-muted-foreground">
                              <p>Concepto: {latestEvaluation.decision ? EVALUATION_DECISION_LABELS[latestEvaluation.decision] : "Sin decisión final"}</p>
                              <p>Fecha: {formatLongDate(latestEvaluation.evaluated_at)}</p>
                              {latestEvaluation.comments && (
                                <p className="line-clamp-2">Obs.: {latestEvaluation.comments}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Sin evaluación registrada.</p>
                          )}
                        </div>

                        {/* Bitácora reciente */}
                        <div className="rounded-xl border border-border/50 bg-muted/30 p-3.5 text-sm">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="font-medium text-foreground">Bitácora reciente</p>
                            <button
                              type="button"
                              onClick={() => setDetailPublication(publication)}
                              className="text-xs text-primary hover:underline"
                            >
                              Ver completa
                            </button>
                          </div>
                          <PublicationWorkflowTimeline
                            events={getWorkflowEventsForPublication(publication.id).slice(0, 3)}
                          />
                        </div>
                      </div>

                      {/* Formulario de evaluación expandible */}
                      {canEvaluate && isEvalExpanded && (
                        <div
                          id={`evaluation-form-${publication.id}`}
                          className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.02] p-5"
                        >
                          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Evaluar y decidir</p>
                              <h3 className="mt-0.5 text-base font-semibold text-foreground">Formulario de evaluación formal</h3>
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Aprobar
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                                <XCircle className="h-3 w-3 text-red-500" /> Rechazar
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                                <Undo2 className="h-3 w-3 text-orange-500" /> Devolver
                              </span>
                            </div>
                          </div>
                          <EvaluationForm
                            publicationId={publication.id}
                            initialEvaluation={latestEvaluation}
                            onSave={handleSaveEvaluation}
                            onDecision={handleEvaluationDecision}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Histórico del evaluador ── */}
        {!isAdmin(user) && (
          <section className="mt-12">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Historial personal</p>
                <h2 className="text-xl font-semibold text-foreground">Mis evaluaciones</h2>
              </div>
            </div>

            {evaluatorHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-12 text-center">
                <ClipboardCheck className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">Sin evaluaciones aún</p>
                <p className="mt-1 text-sm text-muted-foreground">Tus evaluaciones realizadas aparecerán aquí.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {evaluatorHistory.map(({ publication, evaluation }) => (
                  <div key={publication.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className={`h-1 w-full ${
                      evaluation.decision === "approve" ? "bg-lime-500" :
                      evaluation.decision === "reject"  ? "bg-red-500" :
                      "bg-orange-500"
                    }`} />
                    <div className="p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{publication.programa}</Badge>
                        {evaluation.decision && (
                          <Badge variant="outline" className="text-xs">
                            {EVALUATION_DECISION_LABELS[evaluation.decision]}
                          </Badge>
                        )}
                        {evaluation.total_score != null && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                            {evaluation.total_score}/20
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold leading-snug text-foreground">
                        {publication.titulo}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {publication.autor}
                        <span className="mx-1.5 text-border">·</span>
                        {publication.owner_name || publication.owner_username || "No disponible"}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>Evaluada: {formatLongDate(evaluation.evaluated_at)}</p>
                          <p className="flex items-center gap-1.5">
                            Estado actual: <WorkflowStatusBadge status={publication.workflow_status} />
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setDetailPublication(publication)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver completa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Modales ── */}
      <PublicationDetailModal
        publication={detailPublication}
        open={!!detailPublication}
        onOpenChange={(open) => { if (!open) setDetailPublication(null); }}
      />

      {selectedAction && selectedPublication && dialogMap[selectedAction] && (
        <PublicationWorkflowActionDialog
          open
          title={dialogMap[selectedAction]?.title ?? ""}
          description={dialogMap[selectedAction]?.description ?? ""}
          confirmLabel={dialogMap[selectedAction]?.confirmLabel ?? ""}
          comments={comments}
          requireComments={dialogMap[selectedAction]?.requireComments ?? false}
          onCommentsChange={setComments}
          onClose={closeActionDialog}
          onConfirm={() => void handleConfirmAction()}
          isSubmitting={isSubmittingAction}
        />
      )}
    </div>
  );
}
