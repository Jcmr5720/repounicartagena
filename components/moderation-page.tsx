"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ShieldAlert, FileText, ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import { canSuspendDocuments, isAdmin } from "@/lib/permissions";

export function ModerationPage() {
  const { user, isLoading } = useAuth();
  const { publications, isLoading: publicationsLoading } = usePublications();

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
              Solo moderadores y administradores pueden entrar a esta seccion.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Moderacion de documentos
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Usa la vista unificada para buscar, filtrar y aplicar las acciones permitidas segun tu rol.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin(user) ? (
            <Button asChild variant="outline">
              <Link href="/admin">
                Panel de administracion
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link href="/gestion-publicaciones">
              Ir a gestion de publicaciones
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

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
            Acceso rapido
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              La vista unificada concentra busqueda, filtros y acciones por rol.
            </p>
            <p className="text-sm text-muted-foreground">
              Entra para revisar publicaciones, suspender, reactivar, editar o eliminar segun permisos.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/gestion-publicaciones">
              Abrir gestion
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
