"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, FileText, ShieldAlert, Sparkles } from "lucide-react";
import { PublicationWorkflowActionDialog } from "@/components/publication-workflow-action-dialog";
import { PublicationWorkflowTimeline } from "@/components/publication-workflow-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  canAccessModeration,
  canRequestAdjustments,
  canSendToEvaluation,
  canStartDocenteReview,
  isAdmin,
} from "@/lib/permissions";
import { usePublications } from "@/lib/publications-context";
import { PUBLICATION_WORKFLOW_STATUS_LABELS, type Publication, type PublicationWorkflowAction } from "@/lib/types";

export function ModerationPage() {
  const { user, isLoading } = useAuth();
  const {
    applyWorkflowAction,
    getWorkflowEventsForPublication,
    publications,
    isLoading: publicationsLoading,
  } = usePublications();
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedAction, setSelectedAction] = useState<PublicationWorkflowAction | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docenteQueue = useMemo(
    () =>
      publications.filter((publication) =>
        ["enviada", "en_revision_docente", "ajustes_solicitados"].includes(
          publication.workflow_status,
        ),
      ),
    [publications],
  );

  const counts = useMemo(
    () => ({
      pending: publications.filter((publication) => publication.workflow_status === "enviada")
        .length,
      inReview: publications.filter(
        (publication) => publication.workflow_status === "en_revision_docente",
      ).length,
      adjustments: publications.filter(
        (publication) => publication.workflow_status === "ajustes_solicitados",
      ).length,
    }),
    [publications],
  );

  if (isLoading || publicationsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!user || !canAccessModeration(user)) {
    return (
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_32%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
            <CardContent className="p-10 sm:p-12">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <Badge variant="secondary" className="mb-4 bg-muted text-foreground">
                  Acceso privado
                </Badge>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Acceso restringido
                </h1>
                <p className="mt-3 max-w-xl text-base text-muted-foreground">
                  Solo docentes y administradores pueden usar la vista de revision docente.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link href="/gestion-publicaciones">Ir a gestion de publicaciones</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/explorar">Explorar publicaciones</Link>
                  </Button>
                </div>
              </div>
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
    setIsSubmitting(false);
  };

  const handleConfirm = async () => {
    if (!selectedPublication || !selectedAction) {
      return;
    }

    setIsSubmitting(true);
    const result = await applyWorkflowAction(
      selectedPublication.id,
      selectedAction,
      comments,
    );

    if (result.success) {
      closeActionDialog();
      return;
    }

    setIsSubmitting(false);
  };

  const dialogMap: Record<
    PublicationWorkflowAction,
    { title: string; description: string; confirmLabel: string; requireComments: boolean }
  > = {
    submit_for_review: {
      title: "Enviar a revision",
      description: "Confirma que la publicacion debe pasar a revision docente.",
      confirmLabel: "Enviar",
      requireComments: false,
    },
    start_docente_review: {
      title: "Iniciar revision",
      description: "Marca esta publicacion como en revision docente.",
      confirmLabel: "Revisar",
      requireComments: false,
    },
    request_adjustments: {
      title: "Solicitar ajustes",
      description: "Deja observaciones claras para que el estudiante haga cambios.",
      confirmLabel: "Solicitar ajustes",
      requireComments: true,
    },
    send_to_evaluation: {
      title: "Enviar a evaluacion",
      description: "Deja evidencia de cierre de revision antes de pasar a evaluacion.",
      confirmLabel: "Enviar a evaluacion",
      requireComments: true,
    },
    start_evaluation: {
      title: "Evaluar",
      description: "",
      confirmLabel: "",
      requireComments: false,
    },
    approve: {
      title: "Aprobar",
      description: "",
      confirmLabel: "",
      requireComments: false,
    },
    reject: {
      title: "Rechazar",
      description: "",
      confirmLabel: "",
      requireComments: false,
    },
    return_with_observations: {
      title: "Devolver con observaciones",
      description: "",
      confirmLabel: "",
      requireComments: true,
    },
    publish: {
      title: "Publicar",
      description: "",
      confirmLabel: "",
      requireComments: false,
    },
    suspend: {
      title: "Suspender",
      description: "",
      confirmLabel: "",
      requireComments: true,
    },
  };

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_32%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Revision docente
              </Badge>
              <Badge variant="outline">
                {isAdmin(user) ? "Administrador" : "Docente"}
              </Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Flujo de revision academica
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Aqui revisas publicaciones enviadas por estudiantes, solicitas ajustes y las envias a evaluacion cuando esten listas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isAdmin(user) ? (
              <Button asChild variant="outline" className="shadow-sm">
                <Link href="/admin">
                  Panel de administracion
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild className="shadow-sm">
              <Link href="/gestion-publicaciones">
                Ir a evaluacion
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {counts.pending}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En revision</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {counts.inReview}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Con ajustes</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {counts.adjustments}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-6">
          {docenteQueue.length === 0 ? (
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-10 text-center text-muted-foreground">
                No hay publicaciones pendientes en la cola docente.
              </CardContent>
            </Card>
          ) : (
            docenteQueue.map((publication) => (
              <Card key={publication.id} className="border-border/70 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {PUBLICATION_WORKFLOW_STATUS_LABELS[publication.workflow_status]}
                        </Badge>
                        <Badge variant="secondary">{publication.programa}</Badge>
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
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {canStartDocenteReview(user, publication) ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            openActionDialog(publication, "start_docente_review")
                          }
                        >
                          Revisar
                        </Button>
                      ) : null}
                      {canRequestAdjustments(user, publication) ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            openActionDialog(publication, "request_adjustments")
                          }
                        >
                          Solicitar ajustes
                        </Button>
                      ) : null}
                      {canSendToEvaluation(user, publication) ? (
                        <Button
                          onClick={() =>
                            openActionDialog(publication, "send_to_evaluation")
                          }
                        >
                          Enviar a evaluacion
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5">
                    <PublicationWorkflowTimeline
                      events={getWorkflowEventsForPublication(publication.id).slice(0, 4)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedAction && selectedPublication ? (
        <PublicationWorkflowActionDialog
          open
          title={dialogMap[selectedAction].title}
          description={dialogMap[selectedAction].description}
          confirmLabel={dialogMap[selectedAction].confirmLabel}
          comments={comments}
          requireComments={dialogMap[selectedAction].requireComments}
          onCommentsChange={setComments}
          onClose={closeActionDialog}
          onConfirm={() => void handleConfirm()}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </div>
  );
}
