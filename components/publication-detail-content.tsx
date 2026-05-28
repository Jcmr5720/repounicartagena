"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Database,
  FileText,
  GitBranch,
  Square,
  Tag,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { PublicationMetadataSection } from "@/components/publication-metadata-section";
import { PublicationWorkflowTimeline } from "@/components/publication-workflow-timeline";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import {
  DOCUMENT_STATUS_LABELS,
  EVALUATION_CRITERIA,
  EVALUATION_DECISION_LABELS,
  PUBLICATION_WORKFLOW_STATUS_LABELS,
  type Publication,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PublicationDetailContentProps {
  publication: Publication;
}

export function PublicationDetailContent({
  publication,
}: PublicationDetailContentProps) {
  const { user } = useAuth();
  const { getLatestEvaluationForPublication, getWorkflowEventsForPublication } =
    usePublications();
  const {
    cancelSpeaking,
    error,
    isSpeaking,
    isSynthesisSupported,
    speak,
  } = useSpeech();
  const workflowEvents = getWorkflowEventsForPublication(publication.id);
  const latestEvaluation = getLatestEvaluationForPublication(publication.id);

  const spokenSummary = useMemo(() => {
    const content = [
      publication.titulo ? `Titulo: ${publication.titulo}.` : "",
      publication.autor ? `Autor: ${publication.autor}.` : "",
      publication.resumen ? `Resumen: ${publication.resumen}` : "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return content;
  }, [publication.autor, publication.resumen, publication.titulo]);

  const handleSummaryAudio = () => {
    if (isSpeaking) {
      cancelSpeaking();
      return;
    }
    speak(spokenSummary);
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      {/* Lista de pestañas — scroll horizontal en móvil */}
      <TabsList className="mb-2 flex h-auto w-full flex-wrap gap-1 rounded-xl bg-muted p-1 sm:flex-nowrap">
        <TabsTrigger
          value="general"
          className="flex flex-1 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium sm:text-sm"
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span>Información general</span>
        </TabsTrigger>
        <TabsTrigger
          value="bitacora"
          className="flex flex-1 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium sm:text-sm"
        >
          <GitBranch className="h-3.5 w-3.5 shrink-0" />
          <span>Bitácora del flujo</span>
          {workflowEvents.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
              {workflowEvents.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="evaluacion"
          className="flex flex-1 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium sm:text-sm"
        >
          <ClipboardList className="h-3.5 w-3.5 shrink-0" />
          <span>Evaluación académica</span>
        </TabsTrigger>
        <TabsTrigger
          value="metadatos"
          className="flex flex-1 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium sm:text-sm"
        >
          <Database className="h-3.5 w-3.5 shrink-0" />
          <span>Metadatos</span>
        </TabsTrigger>
      </TabsList>

      {/* ─── Pestaña 1: Información general ─────────────────────────────── */}
      <TabsContent value="general" className="mt-4 space-y-6">
        {/* Campos clave */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Autor:</span>
            <span className="font-medium text-foreground">{publication.autor}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Docente que subio:</span>
            <span className="font-medium text-foreground">
              {publication.owner_name || publication.owner_username || "No disponible"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Año:</span>
            <span className="font-medium text-foreground">{publication.año}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Línea temática:</span>
            <span className="font-medium text-foreground">{publication.lineaTematica}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Visibilidad:</span>
            <Badge
              variant={publication.status === "disponible" ? "default" : "secondary"}
              className={
                publication.status === "disponible" ? "bg-green-100 text-green-800" : ""
              }
            >
              {DOCUMENT_STATUS_LABELS[publication.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm sm:col-span-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Flujo académico:</span>
            <Badge variant="outline">
              {PUBLICATION_WORKFLOW_STATUS_LABELS[publication.workflow_status]}
            </Badge>
          </div>
        </div>

        {/* Resumen con audio */}
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="font-semibold text-foreground">Resumen</h4>
            <Button
              type="button"
              variant={isSpeaking ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={handleSummaryAudio}
              disabled={!isSynthesisSupported}
              aria-label={
                isSpeaking ? "Detener lectura del resumen" : "Leer titulo, autor y resumen"
              }
              title={
                isSynthesisSupported
                  ? "Escuchar resumen"
                  : "La lectura por voz no esta disponible en este navegador"
              }
            >
              {isSynthesisSupported ? (
                isSpeaking ? (
                  <>
                    <Square className="h-4 w-4" />
                    Detener lectura
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Escuchar resumen
                  </>
                )
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  Voz no disponible
                </>
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {publication.resumen}
          </p>
          <p className="mt-2 min-h-5 text-xs text-muted-foreground">
            {isSpeaking
              ? "Leyendo titulo, autor y resumen."
              : error
                ? error
                : !isSynthesisSupported
                  ? "La lectura por voz funciona mejor en Chrome o Edge."
                  : "Pulsa el boton para escuchar esta publicacion."}
          </p>
        </div>

        {/* Palabras clave */}
        <div>
          <h4 className="mb-2 font-semibold text-foreground">Palabras clave</h4>
          <div className="flex flex-wrap gap-2">
            {publication.palabrasClave.map((keyword) => (
              <Badge key={keyword} variant="outline" className="gap-1">
                <Tag className="h-3 w-3" />
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* Fecha de publicación */}
        <p className="text-sm text-muted-foreground">
          Publicado el{" "}
          {new Date(
            publication.fechaPublicacion ?? publication.created_at,
          ).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </TabsContent>

      {/* ─── Pestaña 2: Bitácora del flujo ───────────────────────────────── */}
      <TabsContent value="bitacora" className="mt-4">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Historial de acciones
          </p>
          <h4 className="mt-1 text-base font-semibold text-foreground">
            Bitácora del flujo académico
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Registro cronológico de cada transición de estado en el proceso editorial.
          </p>
        </div>
        <PublicationWorkflowTimeline
          events={workflowEvents}
          emptyMessage="Este recurso no tiene eventos visibles para tu sesion actual."
        />
      </TabsContent>

      {/* ─── Pestaña 3: Evaluación académica ─────────────────────────────── */}
      <TabsContent value="evaluacion" className="mt-4">
        {user && latestEvaluation ? (
          <div className="space-y-5">
            {/* Encabezado */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Concepto del comité
                </p>
                <h4 className="mt-1 text-base font-semibold text-foreground">
                  Evaluación académica
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Evidencia formal registrada en Supabase para esta publicacion.
                </p>
              </div>
              {latestEvaluation.total_score !== null ? (
                <Badge className="w-fit bg-amber-100 text-amber-800 hover:bg-amber-100">
                  Puntaje: {latestEvaluation.total_score}/20
                </Badge>
              ) : null}
            </div>

            {/* Resumen de la evaluación */}
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Concepto final:</span>{" "}
                    <span className="text-muted-foreground">
                      {latestEvaluation.decision
                        ? EVALUATION_DECISION_LABELS[latestEvaluation.decision]
                        : "Aun sin decision final"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Fecha:</span>{" "}
                    <span className="text-muted-foreground">
                      {latestEvaluation.evaluated_at
                        ? new Date(latestEvaluation.evaluated_at).toLocaleDateString(
                            "es-CO",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : "No registrada"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Evaluador:</span>{" "}
                    <span className="text-muted-foreground">
                      {latestEvaluation.evaluator_id
                        ? `Usuario ${latestEvaluation.evaluator_id.slice(0, 8)}`
                        : "No disponible"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Estado evaluado:</span>{" "}
                    <span className="text-muted-foreground">
                      {
                        PUBLICATION_WORKFLOW_STATUS_LABELS[
                          latestEvaluation.workflow_status
                        ]
                      }
                    </span>
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Fortalezas:</span>{" "}
                    <span className="text-muted-foreground">
                      {latestEvaluation.strengths || "Sin fortalezas registradas."}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Mejoras:</span>{" "}
                    <span className="text-muted-foreground">
                      {latestEvaluation.improvements || "Sin mejoras registradas."}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Observaciones:</span>{" "}
                    <span className="text-muted-foreground">
                      {latestEvaluation.comments || "Sin observaciones generales."}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Criterios de evaluación */}
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">
                Detalle por criterio
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {EVALUATION_CRITERIA.map((criterion) => {
                  const score = latestEvaluation.criteria_scores?.[criterion.key];
                  const hasScore = typeof score === "number";
                  return (
                    <div
                      key={criterion.key}
                      className="rounded-xl border border-border/70 bg-background p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground">{criterion.label}</p>
                        <Badge
                          variant={hasScore ? "default" : "secondary"}
                          className={
                            hasScore
                              ? "shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-100"
                              : "shrink-0"
                          }
                        >
                          {hasScore ? `${score}/5` : "—"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-background/80 p-6 text-center">
            <ClipboardList className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">
              Evaluación no disponible
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {!user
                ? "Inicia sesión para ver la evaluación académica de esta publicación."
                : "Aún no hay una evaluación registrada para esta publicación."}
            </p>
          </div>
        )}
      </TabsContent>

      {/* ─── Pestaña 4: Metadatos normalizados ───────────────────────────── */}
      <TabsContent value="metadatos" className="mt-4">
        <PublicationMetadataSection publication={publication} />
      </TabsContent>
    </Tabs>
  );
}
