"use client";

import { Calendar, User, Tag, BookOpen, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Publication } from "@/lib/types";

interface PublicationDetailContentProps {
  publication: Publication;
}

export function PublicationDetailContent({
  publication,
}: PublicationDetailContentProps) {
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
          <span className="text-muted-foreground">Línea:</span>
          <span className="font-medium text-foreground">
            {publication.lineaTematica}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Estado:</span>
          <Badge
            variant={publication.estado === "publicado" ? "default" : "secondary"}
            className={
              publication.estado === "publicado" ? "bg-green-100 text-green-800" : ""
            }
          >
            {publication.estado === "publicado" ? "Publicado" : "En revisión"}
          </Badge>
        </div>
      </div>

      <div>
        <h4 className="mb-2 font-semibold text-foreground">Resumen</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {publication.resumen}
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

      <div className="text-sm text-muted-foreground">
        Publicado el{" "}
        {new Date(publication.fechaPublicacion).toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
    </div>
  );
}
