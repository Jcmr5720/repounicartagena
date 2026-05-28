"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, ShieldAlert, Sparkles } from "lucide-react";
import { EvaluationForm } from "@/components/evaluation-form";
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
  type PublicationEvaluationInput,
  type PublicationWorkflowAction,
} from "@/lib/types";

export function PublicationManagementPage() {
  const { user, isLoading } = useAuth();
  const {
    applyWorkflowAction,
    getLatestEvaluationForPublication,
    getWorkflowEventsForPublication,
    publications,
    savePublicationEvaluation,
    isLoading: publicationsLoading,
  } = usePublications();
  const [searchQuery, setSearchQuery] = useState("");
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

  const evaluationQueue = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return publications.filter((publication) => {
      const inQueue =
        [
          "enviada",
          "en_evaluacion",
          "aprobada",
          "rechazada",
          "publicada",
          "suspendida",
          "ajustes_solicitados",
        ].includes(publication.workflow_status) || isAdmin(user);

      const matchesQuery =
        !normalizedQuery ||
        publication.titulo.toLowerCase().includes(normalizedQuery) ||
        publication.autor.toLowerCase().includes(normalizedQuery) ||
        publication.programa.toLowerCase().includes(normalizedQuery);

      return inQueue && matchesQuery;
    });
  }, [publications, searchQuery, user]);

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
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Aqui se concentra la evaluacion formal, la evidencia academica y la
              decision del evaluador. La publicacion final sigue bajo control
              administrativo.
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
                placeholder="Buscar por titulo, autor o programa"
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {evaluationQueue.length === 0 ? (
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-10 text-center text-muted-foreground">
                No hay publicaciones en la cola de evaluacion.
              </CardContent>
            </Card>
          ) : (
            evaluationQueue.map((publication) => {
              const latestEvaluation = getLatestEvaluationForPublication(publication.id);

              return (
                <Card key={publication.id} className="border-border/70 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
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
                            {publication.autor} • {publication.año}
                          </p>
                        </div>
                        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                          {publication.resumen}
                        </p>
                        {latestEvaluation ? (
                          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                            <p className="font-medium text-foreground">
                              Resumen de la ultima evaluacion
                            </p>
                            <p className="mt-1 text-muted-foreground">
                              Concepto final:{" "}
                              {latestEvaluation.decision
                                ? EVALUATION_DECISION_LABELS[latestEvaluation.decision]
                                : "Aun sin decision final"}
                            </p>
                            <p className="text-muted-foreground">
                              Fecha:{" "}
                              {latestEvaluation.evaluated_at
                                ? new Date(
                                    latestEvaluation.evaluated_at,
                                  ).toLocaleDateString("es-CO", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "No registrada"}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {canPublishPublication(user, publication) ? (
                          <Button
                            onClick={() => openActionDialog(publication, "publish")}
                          >
                            Publicar
                          </Button>
                        ) : null}
                        {canSuspendPublication(user, publication) ? (
                          <Button
                            variant="destructive"
                            onClick={() => openActionDialog(publication, "suspend")}
                          >
                            Suspender
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {["enviada", "en_evaluacion"].includes(publication.workflow_status) ? (
                      <div className="mt-6">
                        <EvaluationForm
                          publicationId={publication.id}
                          initialEvaluation={latestEvaluation}
                          onSave={handleSaveEvaluation}
                          onDecision={handleEvaluationDecision}
                        />
                      </div>
                    ) : null}

                    <div className="mt-5">
                      <PublicationWorkflowTimeline
                        events={getWorkflowEventsForPublication(publication.id).slice(0, 5)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

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
