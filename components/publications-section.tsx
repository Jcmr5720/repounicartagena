"use client";

import Link from "next/link";
import { Calendar, User, Tag, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePublications } from "@/lib/publications-context";

export function PublicationsSection() {
  const { publications } = usePublications();

  const displayedPublications = publications
    .filter((p) => p.status === "disponible")
    .slice(0, 6);

  return (
    <section className="bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Recursos digitales recientes
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              Descubre los últimos recursos digitales publicados por la comunidad
            </p>
          </div>
        </div>

        {displayedPublications.length === 0 ? (
          <div className="rounded-lg border border-border bg-background p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">
              No se encontraron recursos digitales
            </h3>
            <p className="mt-2 text-base text-muted-foreground">
              Aun no hay recursos digitales en el repositorio
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedPublications.map((publication) => (
              <Card
                key={publication.id}
                className="group flex flex-col overflow-hidden border-border transition-all hover:border-primary/30 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {publication.programa}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {publication.año}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                      {publication.titulo}
                  </h3>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col pb-4">
                  <div className="mb-3 flex items-center gap-2 text-base text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="truncate">{publication.autor}</span>
                  </div>

                  <p className="mb-4 line-clamp-3 flex-1 text-base text-muted-foreground">
                    {publication.resumen}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {publication.palabrasClave.slice(0, 3).map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="text-xs"
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(
                        publication.fechaPublicacion ?? publication.created_at,
                      ).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-primary hover:text-primary"
                    >
                      <Link href={`/publicaciones/${publication.id}`}>
                        Ver detalle
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
