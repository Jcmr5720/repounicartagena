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
import { Card, CardContent } from "@/components/ui/card";
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
  if (!value) {
    return "No registrada";
  }

  return new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  const [searchQuery, setSearchQuery] = useState("");
  const [detailPublication, setDetailPublication] = useState<Publication | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(
    null,
  );
  const [selectedAction, setSelectedAction] = useState<PublicationWorkflowAction | null>(
    null,
  );
  const [comments, setComments] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const evaluationQueue = useMemo(() => {
    return publications.filter((publication) => {
      const inQueue = [
        "enviada",
        "en_evaluacion",
        "aprobada",
        "rechazada",
        "publicada",
        "suspendida",
        "ajustes_solicitados",
      ].includes(publication.workflow_status);

      const matchesQuery =
        !normalizedQuery ||
        publication.titulo.toLowerCase().includes(normalizedQuery) ||
        publication.autor.toLowerCase().includes(normalizedQuery) ||
        publication.programa.toLowerCase().includes(normalizedQuery) ||
        (publication.owner_name ?? "").toLowerCase().includes(normalizedQuery) ||
        (publication.owner_username ?? "").toLowerCase().includes(normalizedQuery);

      return inQueue && matchesQuery;
    });
  }, [normalizedQuery, publications]);

  const counts = useMemo(
    () => ({
      pending: publications.filter(
        (publication) => publication.workflow_status === "enviada",
      ).length,
      inProgress: publications.filter(
        (publication) => publication.workflow_status === "en_evaluacion",
      ).length,
      approved: publications.filter(
        (publication) => publication.workflow_status === "aprobada",
      ).length,
      published: publications.filter(
        (publication) => publication.workflow_status === "publicada",
      ).length,
    }),
    [publications],
  );

  const evaluatorHistory = useMemo(() => {
    if (!user || isAdmin(user)) {
      return [] as Array<{
        publication: Publication;
        evaluation: PublicationEvaluation;
      }>;
    }

    const latestEvaluationByPublication = new Map<string, PublicationEvaluation>();

    evaluations
      .filter((evaluation) => evaluation.evaluator_id === user.id)
      .forEach((evaluation) => {
        const current = latestEvaluationByPublication.get(evaluation.publication_id);

        if (!current) {
          latestEvaluationByPublication.set(evaluation.publication_id, evaluation);
          return;
        }

        const currentStamp =
          current.evaluated_at ?? current.updated_at ?? current.created_at;
        const nextStamp =
          evaluation.evaluated_at ?? evaluation.updated_at ?? evaluation.created_at;

        if (new Date(nextStamp).getTime() >= new Date(currentStamp).getTime()) {
          latestEvaluationByPublication.set(evaluation.publication_id, evaluation);
        }
      });

    return Array.from(latestEvaluationByPublication.values())
      .map((evaluation) => ({
        evaluation,
        publication: publications.find(
          (publication) => publication.id === evaluation.publication_id,
        ),
      }))
      .filter(
        (
          item,
        ): item is {
          publication: Publication;
          evaluation: PublicationEvaluation;
        } => !!item.publication,
      )
      .sort((left, right) => {
        const leftStamp =
          left.evaluation.evaluated_at ??
          left.evaluation.updated_at ??
          left.evaluation.created_at;
        const rightStamp =
          right.evaluation.evaluated_at ??
          right.evaluation.updated_at ??
          right.evaluation.created_at;

        return new Date(rightStamp).getTime() - new Date(leftStamp).getTime();
      });
  }, [evaluations, publications, user]);

  if (isLoading || publicationsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!user || !(canAccessEvaluation(user) || isAdmin(user))) {
    return (
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_30%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
            <CardContent className="p-10 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold text-foreground">
                Acceso restringido
              </h1>
              <p className="mt-3 text-muted-foreground">
                Esta vista esta reservada para evaluadores y administradores.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const openActionDialog = (
    publication: Publication,
    action: PublicationWorkflowAction,
  ) => {
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

  const handleWorkflowAction = async (
    publicationId: string,
    action: PublicationWorkflowAction,
    actionComments?: string,
  ) => {
    setFeedback(null);
    const result = await applyWorkflowAction(publicationId, action, actionComments);

    if (!result.success) {
      setFeedback({
        kind: "error",
        message: result.error || "No se pudo ejecutar la accion del flujo.",
      });
      return false;
    }

    setFeedback({
      kind: "success",
      message: "La accion del flujo academico se ejecuto correctamente.",
    });
    return true;
  };

  const ensureEvaluationStarted = async (publicationId: string) => {
    const publication = publications.find((item) => item.id === publicationId);

    if (!publication || publication.workflow_status !== "enviada") {
      return { success: true };
    }

    return applyWorkflowAction(publicationId, "start_evaluation");
  };

  const handleConfirmAction = async () => {
    if (!selectedPublication || !selectedAction) {
      return;
    }

    setIsSubmittingAction(true);
    const success = await handleWorkflowAction(
      selectedPublication.id,
      selectedAction,
      comments,
    );

    if (success) {
      closeActionDialog();
      return;
    }

    setIsSubmittingAction(false);
  };

  const handleSaveEvaluation = async (input: PublicationEvaluationInput) => {
    const startResult = await ensureEvaluationStarted(input.publication_id);

    if (!startResult.success) {
      return startResult;
    }

    return savePublicationEvaluation(input);
  };

  const handleEvaluationDecision = async (
    input: PublicationEvaluationInput,
    action: EvaluationDecision,
  ) => {
    const startResult = await ensureEvaluationStarted(input.publication_id);

    if (!startResult.success) {
      return startResult;
    }

    const saveResult = await savePublicationEvaluation({
      ...input,
      decision: action,
    });

    if (!saveResult.success) {
      return saveResult;
    }

    const workflowAction: PublicationWorkflowAction =
      action === "approve"
        ? "approve"
        : action === "reject"
          ? "reject"
          : "return_with_observations";

    const transitionResult = await applyWorkflowAction(
      input.publication_id,
      workflowAction,
      input.comments,
    );

    if (!transitionResult.success) {
      return transitionResult;
    }

    setFeedback({
      kind: "success",
      message: `La decision ${EVALUATION_DECISION_LABELS[action].toLowerCase()} quedo registrada y el flujo avanzo correctamente.`,
    });
    return { success: true };
  };

  const dialogMap: Partial<
    Record<
      PublicationWorkflowAction,
      {
        title: string;
        description: string;
        confirmLabel: string;
        requireComments: boolean;
      }
    >
  > = {
    publish: {
      title: "Publicar recurso",
      description:
        "Confirma que la publicacion aprobada quedara visible al publico.",
      confirmLabel: "Publicar",
      requireComments: false,
    },
    suspend: {
      title: "Suspender recurso",
      description:
        "Deja evidencia de la razon por la que se retira de la vista publica.",
      confirmLabel: "Suspender",
      requireComments: true,
    },
  };

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Evaluacion y control
              </Badge>
              <Badge variant="outline">
                {isAdmin(user) ? "Administrador" : "Evaluador"}
              </Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Gestion de publicaciones
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              Revisa el recurso completo antes de decidir. La inspeccion del
              contenido, la bitacora y la evaluacion academica ahora viven en el
              mismo flujo de gestion.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={isAdmin(user) ? "/admin" : "/explorar"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>
        </div>

        {feedback ? (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm ${
              feedback.kind === "success"
                ? "bg-green-50 text-green-800"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Enviadas</p>
              <p className="text-3xl font-semibold text-foreground">{counts.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">En evaluacion</p>
              <p className="text-3xl font-semibold text-foreground">
                {counts.inProgress}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Aprobadas</p>
              <p className="text-3xl font-semibold text-foreground">{counts.approved}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Publicadas</p>
              <p className="text-3xl font-semibold text-foreground">
                {counts.published}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por titulo, autor, programa o docente que subio"
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Cola operativa
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">
                Publicaciones por revisar
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifica el recurso completo, luego evalua o aplica acciones del flujo.
              </p>
            </div>
          </div>

          {evaluationQueue.length === 0 ? (
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-10 text-center text-muted-foreground">
                No hay publicaciones en la cola de evaluacion.
              </CardContent>
            </Card>
          ) : (
            evaluationQueue.map((publication) => {
              const latestEvaluation = getLatestEvaluationForPublication(publication.id);
              const canEvaluate = ["enviada", "en_evaluacion"].includes(
                publication.workflow_status,
              );

              return (
                <Card key={publication.id} className="border-border/70 shadow-sm">
                  <CardContent className="p-6">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">
                            {
                              PUBLICATION_WORKFLOW_STATUS_LABELS[
                                publication.workflow_status
                              ]
                            }
                          </Badge>
                          <Badge variant="secondary">{publication.programa}</Badge>
                          {latestEvaluation?.total_score !== null &&
                          latestEvaluation?.total_score !== undefined ? (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Puntaje: {latestEvaluation.total_score}/20
                            </Badge>
                          ) : null}
                          {latestEvaluation?.decision ? (
                            <Badge variant="secondary">
                              {EVALUATION_DECISION_LABELS[latestEvaluation.decision]}
                            </Badge>
                          ) : null}
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground">
                            {publication.titulo}
                          </h2>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {publication.autor} | Subido por{" "}
                            {publication.owner_name ||
                              publication.owner_username ||
                              "No disponible"}
                          </p>
                        </div>

                        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                          {publication.resumen}
                        </p>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
                            <p className="font-medium text-foreground">Revision</p>
                            <p className="mt-1 text-muted-foreground">
                              Abre la publicacion completa para verificar archivo, metadatos,
                              bitacora y evaluacion antes de decidir.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                className="gap-2"
                                onClick={() => setDetailPublication(publication)}
                              >
                                <Eye className="h-4 w-4" />
                                Ver publicacion completa
                              </Button>
                              {canEvaluate ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => {
                                    const element = document.getElementById(
                                      `evaluation-form-${publication.id}`,
                                    );
                                    element?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                  }}
                                >
                                  <ClipboardCheck className="h-4 w-4" />
                                  Evaluar
                                </Button>
                              ) : null}
                            </div>
                          </div>

                          <div className="rounded-xl border border-border/70 bg-background p-4 text-sm">
                            <p className="font-medium text-foreground">
                              Ultimo estado academico
                            </p>
                            {latestEvaluation ? (
                              <div className="mt-2 space-y-1 text-muted-foreground">
                                <p>
                                  Concepto:{" "}
                                  {latestEvaluation.decision
                                    ? EVALUATION_DECISION_LABELS[
                                        latestEvaluation.decision
                                      ]
                                    : "Aun sin decision final"}
                                </p>
                                <p>
                                  Fecha: {formatLongDate(latestEvaluation.evaluated_at)}
                                </p>
                                <p>
                                  Observaciones:{" "}
                                  {latestEvaluation.comments || "Sin observaciones generales."}
                                </p>
                              </div>
                            ) : (
                              <p className="mt-2 text-muted-foreground">
                                Todavia no existe una evaluacion registrada para este
                                recurso.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-border/70 bg-background p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Bitacora reciente del flujo
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Resumen rapido de los ultimos movimientos.
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailPublication(publication)}
                            >
                              Ver completa
                            </Button>
                          </div>
                          <PublicationWorkflowTimeline
                            events={getWorkflowEventsForPublication(publication.id).slice(0, 4)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-border/70 bg-background p-4">
                          <p className="text-sm font-semibold text-foreground">
                            Acciones visibles
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Mantiene separadas la revision del recurso y las decisiones del
                            flujo.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-2"
                              onClick={() => setDetailPublication(publication)}
                            >
                              <Eye className="h-4 w-4" />
                              Ver publicacion completa
                            </Button>
                            {canEvaluate ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="gap-2"
                                onClick={() => {
                                  const element = document.getElementById(
                                    `evaluation-form-${publication.id}`,
                                  );
                                  element?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }}
                              >
                                <ClipboardCheck className="h-4 w-4" />
                                Evaluar
                              </Button>
                            ) : null}
                            {canPublishPublication(user, publication) ? (
                              <Button
                                type="button"
                                className="gap-2"
                                onClick={() => openActionDialog(publication, "publish")}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Publicar
                              </Button>
                            ) : null}
                            {canSuspendPublication(user, publication) ? (
                              <Button
                                type="button"
                                variant="destructive"
                                className="gap-2"
                                onClick={() => openActionDialog(publication, "suspend")}
                              >
                                <Undo2 className="h-4 w-4" />
                                Suspender
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {canEvaluate ? (
                      <div
                        id={`evaluation-form-${publication.id}`}
                        className="mt-6 rounded-2xl border border-border/70 bg-background/80 p-4 sm:p-5"
                      >
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                              Evaluar y decidir
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-foreground">
                              Formulario de evaluacion formal
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Aprobar
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                              <XCircle className="h-3.5 w-3.5" />
                              Rechazar
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                              <Undo2 className="h-3.5 w-3.5" />
                              Devolver con observaciones
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
                    ) : null}
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>

        {!isAdmin(user) ? (
          <section className="mt-10 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <History className="h-3.5 w-3.5" />
                Historico de mis evaluaciones
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Historico de mis evaluaciones
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Consulta rapidamente lo ultimo que ya evaluaste y vuelve al
                detalle completo cuando necesites verificarlo.
              </p>
            </div>

            {evaluatorHistory.length === 0 ? (
              <Card className="border-border/70 shadow-sm">
                <CardContent className="p-10 text-center text-muted-foreground">
                  Aun no has realizado evaluaciones.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {evaluatorHistory.map(({ publication, evaluation }) => (
                  <Card key={publication.id} className="border-border/70 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{publication.programa}</Badge>
                          {evaluation.decision ? (
                            <Badge variant="outline">
                              {EVALUATION_DECISION_LABELS[evaluation.decision]}
                            </Badge>
                          ) : null}
                          {evaluation.total_score !== null ? (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              {evaluation.total_score}/20
                            </Badge>
                          ) : null}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">
                            {publication.titulo}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {publication.autor} · Subido por{" "}
                            {publication.owner_name ||
                              publication.owner_username ||
                              "No disponible"}
                          </p>
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <p>Fecha de evaluacion: {formatLongDate(evaluation.evaluated_at)}</p>
                          <p>
                            Estado actual:{" "}
                            {
                              PUBLICATION_WORKFLOW_STATUS_LABELS[
                                publication.workflow_status
                              ]
                            }
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => setDetailPublication(publication)}
                          >
                            <Eye className="h-4 w-4" />
                            Ver publicacion completa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>

      <PublicationDetailModal
        publication={detailPublication}
        open={!!detailPublication}
        onOpenChange={(open) => {
          if (!open) {
            setDetailPublication(null);
          }
        }}
      />

      {selectedAction && selectedPublication && dialogMap[selectedAction] ? (
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
      ) : null}
    </div>
  );
}
