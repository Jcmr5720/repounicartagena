"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, FileText, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import { canSuspendDocuments, isAdmin } from "@/lib/permissions";

export function ModerationPage() {
  const { user, isLoading } = useAuth();
  const { publications, isLoading: publicationsLoading } = usePublications();

  const counts = useMemo(
    () => ({
      available: publications.filter((publication) => publication.status === "disponible").length,
      suspended: publications.filter((publication) => publication.status === "suspendido").length,
      total: publications.length,
    }),
    [publications],
  );

  if (isLoading || publicationsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!user || !canSuspendDocuments(user)) {
    return (
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_32%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
            <CardContent className="p-10 sm:p-12">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <Badge variant="secondary" className="mb-4 bg-muted text-foreground">
                  Acceso privado
                </Badge>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Acceso restringido
                </h1>
                <p className="mt-3 max-w-xl text-base text-muted-foreground">
                  Solo moderadores y administradores pueden usar la vista de moderación.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link href="/gestion-publicaciones">Ir a gestión de publicaciones</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/explorar">Explorar publicaciones</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_32%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Vista secundaria
              </Badge>
              <Badge variant="outline">
                {isAdmin(user) ? "Administrador" : "Moderador"}
              </Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Moderación de documentos
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Esta pantalla actúa como puerta de entrada al panel unificado donde puedes buscar,
              filtrar y gestionar publicaciones con una interfaz más clara.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isAdmin(user) ? (
              <Button asChild variant="outline" className="shadow-sm">
                <Link href="/admin">
                  Panel de administración
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild className="shadow-sm">
              <Link href="/gestion-publicaciones">
                Abrir gestión
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{counts.available}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suspendidos</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{counts.suspended}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{counts.total}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 overflow-hidden border-border/70 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
          <CardContent className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Entrada rápida a la gestión unificada
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                La nueva vista concentra filtros, búsqueda y acciones por rol en una sola
                experiencia, para que no tengas que saltar entre pantallas.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link href="/gestion-publicaciones">
                  Abrir gestión
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/subir">Subir documento</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
