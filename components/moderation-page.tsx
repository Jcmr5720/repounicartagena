"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShieldAlert, FileText, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import { canSuspendDocuments, isAdmin } from "@/lib/permissions";
import { DOCUMENT_STATUS_LABELS } from "@/lib/types";

export function ModerationPage() {
  const { user, isLoading } = useAuth();
  const { publications, updatePublication, isLoading: publicationsLoading } = usePublications();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const counts = useMemo(() => {
    return {
      available: publications.filter((publication) => publication.status === "disponible").length,
      suspended: publications.filter((publication) => publication.status === "suspendido").length,
    };
  }, [publications]);

  if (isLoading || publicationsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!user || !canSuspendDocuments(user)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Acceso restringido
            </h2>
            <p className="text-muted-foreground">
              Solo moderadores y administradores pueden suspender o reactivar documentos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleStatus = async (publicationId: string, currentStatus: "disponible" | "suspendido") => {
    setUpdatingId(publicationId);
    setErrorMessage("");

    const nextStatus = currentStatus === "disponible" ? "suspendido" : "disponible";
    const result = await updatePublication(publicationId, { status: nextStatus, estado: nextStatus });

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo actualizar el estado del documento");
    }

    setUpdatingId(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Moderación de documentos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Suspende o reactiva documentos publicados por la comunidad.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin(user) ? (
            <Button asChild variant="outline">
              <Link href="/admin">
                Panel de administración
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link href="/subir">Administrar documentos</Link>
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.available}</p>
              <p className="text-sm text-muted-foreground">Documentos disponibles</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <RefreshCw className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.suspended}</p>
              <p className="text-sm text-muted-foreground">Documentos suspendidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Lista de documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {publications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No hay documentos para moderar
            </div>
          ) : (
            <div className="space-y-4">
              {publications.map((publication) => (
                <div
                  key={publication.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-foreground line-clamp-1">
                        {publication.titulo}
                      </h4>
                      <Badge
                        variant={publication.status === "disponible" ? "default" : "secondary"}
                      >
                        {DOCUMENT_STATUS_LABELS[publication.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {publication.autor} • {publication.programa} • {publication.año}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={publication.status === "disponible" ? "secondary" : "default"}
                      onClick={() => toggleStatus(publication.id, publication.status)}
                      disabled={updatingId === publication.id}
                    >
                      {publication.status === "disponible" ? "Suspender" : "Reactivar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
