"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { PublicationWorkflowActionDialog } from "@/components/publication-workflow-action-dialog";
import { PublicationWorkflowTimeline } from "@/components/publication-workflow-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import {
  canAccessEvaluation,
  canApprovePublication,
  canPublishPublication,
  canRejectPublication,
  canReturnWithObservations,
  canStartEvaluation,
  canSuspendPublication,
  isAdmin,
} from "@/lib/permissions";
import { usePublications } from "@/lib/publications-context";
import {
  PUBLICATION_WORKFLOW_STATUS_LABELS,
  type Publication,
  type PublicationWorkflowAction,
} from "@/lib/types";

export function PublicationManagementPage() {
  const { user, isLoading } = useAuth();
  const {
    applyWorkflowAction,
    getWorkflowEventsForPublication,
    publications,
    isLoading: publicationsLoading,
  } = usePublications();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedAction, setSelectedAction] = useState<PublicationWorkflowAction | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const evaluationQueue = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return publications.filter((publication) => {
      const inQueue =
        [
          "enviada_a_evaluacion",
          "en_evaluacion",
          "aprobada",
          "rechazada",
          "publicada",
          "suspendida",
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
        (publication) => publication.workflow_status === "enviada_a_evaluacion",
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
            <CardContent className="p-10 sm:p-12 text-center">
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
      title: "",
      description: "",
      confirmLabel: "",
      requireComments: false,
    },
    start_docente_review: {
      title: "",
      description: "",
      confirmLabel: "",
      requireComments: false,
    },
    request_adjustments: {
      title: "",
      description: "",
      confirmLabel: "",
      requireComments: true,
    },
    send_to_evaluation: {
      title: "",
      description: "",
      confirmLabel: "",
      requireComments: true,
    },
    start_evaluation: {
      title: "Iniciar evaluacion",
      description: "Marca la publicacion como en proceso de evaluacion formal.",
      confirmLabel: "Evaluar",
      requireComments: false,
    },
    approve: {
      title: "Aprobar publicacion",
      description: "Registra la aprobacion academica de este recurso.",
      confirmLabel: "Aprobar",
      requireComments: true,
    },
    reject: {
      title: "Rechazar publicacion",
      description: "Deja la justificacion academica del rechazo.",
      confirmLabel: "Rechazar",
      requireComments: true,
    },
    return_with_observations: {
      title: "Devolver con observaciones",
      description: "Devuelve el recurso para ajustes con observaciones claras.",
      confirmLabel: "Devolver",
      requireComments: true,
    },
    publish: {
      title: "Publicar recurso",
      description: "Confirma que la publicacion aprobada quedara visible al publico.",
      confirmLabel: "Publicar",
      requireComments: false,
    },
    suspend: {
      title: "Suspender recurso",
      description: "Deja evidencia de la razon por la que se retira de la vista publica.",
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
              Aqui se concentra la evaluacion formal, las decisiones academicas y la publicacion final del recurso.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={isAdmin(user) ? "/admin" : "/moderacion"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-3xl font-semibold text-foreground">{counts.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">En evaluacion</p>
              <p className="text-3xl font-semibold text-foreground">{counts.inProgress}</p>
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
              <p className="text-3xl font-semibold text-foreground">{counts.published}</p>
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
            evaluationQueue.map((publication) => (
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
                      {canStartEvaluation(user, publication) ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            openActionDialog(publication, "start_evaluation")
                          }
                        >
                          Evaluar
                        </Button>
                      ) : null}
                      {canApprovePublication(user, publication) ? (
                        <Button
                          onClick={() => openActionDialog(publication, "approve")}
                        >
                          Aprobar
                        </Button>
                      ) : null}
                      {canRejectPublication(user, publication) ? (
                        <Button
                          variant="outline"
                          onClick={() => openActionDialog(publication, "reject")}
                        >
                          Rechazar
                        </Button>
                      ) : null}
                      {canReturnWithObservations(user, publication) ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            openActionDialog(publication, "return_with_observations")
                          }
                        >
                          Devolver con observaciones
                        </Button>
                      ) : null}
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

                  <div className="mt-5">
                    <PublicationWorkflowTimeline
                      events={getWorkflowEventsForPublication(publication.id).slice(0, 5)}
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
