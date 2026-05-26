import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Politica de cookies | Repositorio REDS Colombia",
  description: "Politica de cookies del Repositorio REDS Colombia",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Cookies
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Politica de cookies
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
          Este texto explica como usamos cookies y otras tecnologias similares en
          el Repositorio REDS Colombia. Esta version funciona como base
          informativa y puede ajustarse a la revision institucional que se
          requiera.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Que cookies usamos
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Usamos cookies esenciales para que el sitio funcione correctamente.
              Entre ellas esta la cookie o almacenamiento tecnico que recuerda el
              estado de la barra lateral y las preferencias basicas de sesion.
            </p>
            <p>
              En este momento no activamos cookies publicitarias ni de analitica
              sin tu consentimiento previo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Como puedes controlar tu preferencia
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Desde el banner de cookies puedes aceptar todo, rechazar lo no
              esencial o continuar solo con las cookies necesarias.
            </p>
            <p>
              Si cambias de opinion, puedes borrar el almacenamiento del navegador
              y volvera a mostrarse el aviso en tu siguiente visita.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Cambios en esta politica
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Podemos actualizar esta politica cuando cambien las herramientas del
              sitio o cuando se incorporen nuevos servicios que usen cookies.
            </p>
            <Separator />
            <p>
              Para dudas sobre este contenido, escribe a{" "}
              <Link
                href="mailto:repositorio@redscolombia.edu.co"
                className="text-primary underline-offset-4 hover:underline"
              >
                repositorio@redscolombia.edu.co
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
