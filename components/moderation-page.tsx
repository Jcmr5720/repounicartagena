"use client";

import Link from "next/link";
import { ArrowRight, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { canAccessModeration, isAdmin } from "@/lib/permissions";

export function ModerationPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!user || !canAccessModeration(user)) {
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
                  Esta vista quedo reservada para administracion y compatibilidad del
                  sistema.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link href="/gestion-publicaciones">Ir a evaluacion</Link>
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

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Compatibilidad operativa
                  </Badge>
                  <Badge variant="outline">
                    {isAdmin(user) ? "Administrador" : "Acceso interno"}
                  </Badge>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Vista de moderacion desactivada para el flujo oficial
                </h1>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  El flujo vigente ya no usa una etapa docente separada. Ahora el
                  docente crea la publicacion en <strong>/subir</strong>, la envia a
                  evaluacion y el evaluador decide desde la pantalla formal de
                  evaluacion.
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Info className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">
                  Flujo actual
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Docente crea o edita su recurso, lo envia a evaluacion, el
                  evaluador diligencia la rubrica y decide, y el administrador
                  conserva la publicacion final por compatibilidad institucional.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">
                  Acciones recomendadas
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  <Button asChild>
                    <Link href="/subir">
                      Gestionar publicaciones docentes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/gestion-publicaciones">
                      Abrir evaluacion formal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
