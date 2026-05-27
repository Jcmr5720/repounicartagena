"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Calendar,
  FileText,
  Square,
  Tag,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { PublicationMetadataSection } from "@/components/publication-metadata-section";
import { PublicationWorkflowTimeline } from "@/components/publication-workflow-timeline";
import { usePublications } from "@/lib/publications-context";
import {
  DOCUMENT_STATUS_LABELS,
  PUBLICATION_WORKFLOW_STATUS_LABELS,
  type Publication,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PublicationDetailContentProps {
  publication: Publication;
}

export function PublicationDetailContent({
  publication,
}: PublicationDetailContentProps) {
  const { getWorkflowEventsForPublication } = usePublications();
  const {
    cancelSpeaking,
    error,
    isSpeaking,
    isSynthesisSupported,
    speak,
  } = useSpeech();
  const workflowEvents = getWorkflowEventsForPublication(publication.id);

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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Autor:</span>
          <span className="font-medium text-foreground">{publication.autor}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Año:</span>
          <span className="font-medium text-foreground">{publication.año}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Linea:</span>
          <span className="font-medium text-foreground">
            {publication.lineaTematica}
          </span>
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
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Flujo academico:</span>
          <Badge variant="outline">
            {PUBLICATION_WORKFLOW_STATUS_LABELS[publication.workflow_status]}
          </Badge>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h4 className="font-semibold text-foreground">Resumen</h4>
          <Button
            type="button"
            variant={isSpeaking ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={handleSummaryAudio}
            disabled={!isSynthesisSupported}
            aria-label={
              isSpeaking
                ? "Detener lectura del resumen"
                : "Leer titulo, autor y resumen"
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

      <div>
        <h4 className="mb-3 font-semibold text-foreground">Bitacora del flujo</h4>
        <PublicationWorkflowTimeline
          events={workflowEvents}
          emptyMessage="Este recurso no tiene eventos visibles para tu sesion actual."
        />
      </div>

      <PublicationMetadataSection publication={publication} />

      <div className="text-sm text-muted-foreground">
        Publicado el{" "}
        {new Date(publication.fechaPublicacion ?? publication.created_at).toLocaleDateString(
          "es-CO",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        )}
      </div>
    </div>
  );
}
