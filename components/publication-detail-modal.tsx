"use client";

import { Download } from "lucide-react";
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
import { PublicationDetailContent } from "./publication-detail-content";

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
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
              <p className="mt-2 text-sm text-muted-foreground">
                Autor: {publication.autor} · Subido por{" "}
                {publication.owner_name || publication.owner_username || "No disponible"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <PublicationDetailContent publication={publication} />

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
