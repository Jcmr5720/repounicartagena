"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublicationMetadataGroups } from "@/lib/publication-metadata";
import type { Publication } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PublicationMetadataSectionProps {
  publication: Publication;
}

export function PublicationMetadataSection({
  publication,
}: PublicationMetadataSectionProps) {
  const groups = getPublicationMetadataGroups(publication);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(groups.map((g) => [g.standard, true])),
  );

  const toggleGroup = (standard: string) => {
    setExpandedGroups((prev) => ({ ...prev, [standard]: !prev[standard] }));
  };

  return (
    <section className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Metadatos normalizados
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Perfil Dublin Core + LOM — campos descriptivos, técnicos y educativos.
          </p>
        </div>
        <Badge variant="outline" className="self-start bg-background sm:self-auto">
          Recurso académico
        </Badge>
      </div>

      {/* Grupos colapsables */}
      {groups.map((group) => {
        const isOpen = expandedGroups[group.standard];
        return (
          <div
            key={group.standard}
            className="overflow-hidden rounded-2xl border border-border/70 bg-background"
          >
            {/* Cabecera del grupo — clic para colapsar */}
            <button
              type="button"
              onClick={() => toggleGroup(group.standard)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-foreground">
                  {group.title}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {group.fields.length} campos
                </Badge>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>

            {/* Tabla de campos */}
            {isOpen && (
              <div className="border-t border-border/70">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="w-[30%] px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                        Campo
                      </th>
                      <th className="w-[25%] px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                        Clave
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {group.fields.map((field, idx) => (
                      <tr
                        key={field.key}
                        className={cn(
                          "align-top transition-colors hover:bg-muted/20",
                          idx % 2 === 0 ? "bg-background" : "bg-muted/10",
                        )}
                      >
                        {/* Label */}
                        <td className="px-4 py-3 font-medium text-foreground">
                          {field.label}
                        </td>
                        {/* Key técnica */}
                        <td className="px-4 py-3">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-primary/80">
                            {field.key}
                          </code>
                        </td>
                        {/* Valor + justificación */}
                        <td className="px-4 py-3">
                          <p className="break-words text-foreground">{field.value}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {field.justification}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
