"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePublications } from "@/lib/publications-context";
import { PublicationDetailContent } from "./publication-detail-content";

interface PublicationDetailPageProps {
  publicationId: string;
}

export function PublicationDetailPage({
  publicationId,
}: PublicationDetailPageProps) {
  const { getPublicationById, isLoading } = usePublications();
  const publication = getPublicationById(publicationId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Publicación no encontrada
            </h2>
            <p className="mb-6 text-muted-foreground">
              El recurso digital solicitado no existe o no esta disponible todavia.
            </p>
            <Button asChild>
              <Link href="/explorar">Volver a explorar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/explorar">
            <ArrowLeft className="h-4 w-4" />
            Volver a explorar
          </Link>
        </Button>

        {publication.pdfUrl ? (
          <Button asChild className="gap-2">
            <Link href={publication.pdfUrl} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
              Descargar PDF
            </Link>
          </Button>
        ) : (
          <Button disabled className="gap-2">
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>
        )}
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-balance text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {publication.titulo}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Detalle del recurso digital en el repositorio
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PublicationDetailContent publication={publication} />
        </CardContent>
      </Card>
    </div>
  );
}
