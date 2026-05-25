"use client";

import { Download, Calendar, User, Tag, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Publication } from "@/lib/types";

interface PublicationDetailModalProps {
  publication: Publication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicationDetailModal({
  publication,
  open,
  onOpenChange,
}: PublicationDetailModalProps) {
  if (!publication) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge
                variant="secondary"
                className="mb-2 bg-primary/10 text-primary"
              >
                {publication.programa}
              </Badge>
              <DialogTitle className="text-xl leading-tight">
                {publication.titulo}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Meta info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Autor:</span>
              <span className="font-medium text-foreground">
                {publication.autor}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Año:</span>
              <span className="font-medium text-foreground">
                {publication.año}
              </span>
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
                variant={
                  publication.status === "disponible" ? "default" : "secondary"
                }
                className={
                  publication.status === "disponible"
                    ? "bg-green-100 text-green-800"
                    : ""
                }
              >
                {publication.status === "disponible"
                  ? "Disponible"
                  : "Suspendido"}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h4 className="mb-2 font-semibold text-foreground">Resumen</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {publication.resumen}
            </p>
          </div>

          {/* Keywords */}
          <div>
            <h4 className="mb-2 font-semibold text-foreground">
              Palabras clave
            </h4>
            <div className="flex flex-wrap gap-2">
              {publication.palabrasClave.map((keyword) => (
                <Badge key={keyword} variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Publication date */}
          <div className="text-sm text-muted-foreground">
            Publicado el{" "}
            {new Date(
              publication.fechaPublicacion ?? publication.created_at,
            ).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
            {publication.pdfUrl ? (
              <Button asChild className="flex-1 gap-2">
                <Link href={publication.pdfUrl} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Link>
              </Button>
            ) : (
              <Button disabled className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Descargar PDF
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
