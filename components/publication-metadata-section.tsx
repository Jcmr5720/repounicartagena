"use client";

import { Badge } from "@/components/ui/badge";
import { getPublicationMetadataGroups } from "@/lib/publication-metadata";
import type { Publication } from "@/lib/types";

interface PublicationMetadataSectionProps {
  publication: Publication;
}

export function PublicationMetadataSection({
  publication,
}: PublicationMetadataSectionProps) {
  const groups = getPublicationMetadataGroups(publication);

  return (
    <section className="rounded-3xl border border-border/70 bg-muted/20 p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Metadatos normalizados
          </p>
          <h4 className="mt-2 text-lg font-semibold text-foreground">
            Perfil Dublin Core + LOM
          </h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Estos campos se derivan del recurso y se alinean con metadatos
            descriptivos, técnicos y educativos útiles para un repositorio académico.
          </p>
        </div>
        <Badge variant="outline" className="self-start bg-background">
          Recurso académico
        </Badge>
      </div>

      <div className="mt-5 space-y-6">
        {groups.map((group) => (
          <div key={group.standard} className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{group.title}</p>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {group.fields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-2xl border border-border/70 bg-background/90 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-primary/80">
                        {field.standard}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {field.label}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {field.key}
                    </Badge>
                  </div>
                  <p className="mt-3 break-words text-sm leading-6 text-foreground">
                    {field.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {field.justification}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
