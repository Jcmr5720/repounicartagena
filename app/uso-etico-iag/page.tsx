import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Uso etico de la IAG | Repositorio REDS Colombia",
  description:
    "Declaracion institucional sobre el uso etico de la inteligencia artificial generativa en el Repositorio REDS Colombia",
};

const aiTools = [
  "Claude Opus 4.8",
  "ChatGPT 5.4",
];

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          IAG
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Uso etico de la IAG
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
          Este espacio documenta el uso responsable de herramientas de
          inteligencia artificial generativa como apoyo para redaccion,
          busqueda o verificacion de ideas, sin sustituir la autoria academica
          ni el pensamiento propio.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Proposito de esta declaracion
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              En este proyecto, la IAG puede emplearse como apoyo puntual para
              organizar ideas, mejorar redaccion o explorar informacion de base.
              Su uso no reemplaza el analisis propio, la revision critica ni la
              responsabilidad intelectual de quienes elaboran el contenido.
            </p>
            <p>
              La version publicada busca dejar trazabilidad sobre el apoyo
              recibido y mantener una separacion clara entre asistencia tecnica
              y autorias academicas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Herramientas utilizadas
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Las herramientas de IAG utilizadas para apoyo en redaccion,
              busqueda y organizacion de ideas fueron las siguientes:
            </p>
            <ul className="space-y-3">
              {aiTools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Autoria y pensamiento propio
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              El contenido final del proyecto conserva la autoria de quienes lo
              desarrollan. La IAG se entiende como herramienta de apoyo, no como
              sustituto del criterio, la seleccion de fuentes ni la elaboracion
              academica original.
            </p>
            <Separator />
            <p>
              Si se requiere ajustar esta declaracion para una entrega
              institucional especifica, se puede ampliar con nombres de
              herramientas, fechas de uso y una delimitacion mas detallada del
              alcance de la asistencia recibida.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
