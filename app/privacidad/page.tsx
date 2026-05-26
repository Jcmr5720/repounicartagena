import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Politica de privacidad | Repositorio REDS Colombia",
  description: "Politica de privacidad del Repositorio REDS Colombia",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Privacidad
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Politica de privacidad
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
          Esta politica resume que tipo de datos puede tratar la plataforma y con
          que finalidad. Sirve como base de transparencia para quienes consultan,
          publican o administran contenido en el repositorio.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Que datos podemos tratar
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Segun el uso de la plataforma, podemos tratar datos de cuenta,
              correo institucional, nombre de usuario, nombre completo y la
              informacion que compartas al publicar recursos.
            </p>
            <p>
              Tambien pueden generarse datos tecnicos basicos de funcionamiento,
              como los necesarios para iniciar sesion o recordar preferencias
              esenciales de interfaz.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Para que usamos esa informacion
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Usamos los datos para permitir acceso, gestionar publicaciones,
              mantener el repositorio y responder solicitudes de soporte o
              administracion.
            </p>
            <p>
              No vendemos informacion personal ni usamos tus datos para fines
              ajenos al funcionamiento del repositorio.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">
              Derechos y contacto
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Si quieres corregir, revisar o retirar informacion asociada a tu
              cuenta, puedes escribir al equipo responsable del repositorio.
            </p>
            <Separator />
            <p>
              Contacto:{" "}
              <Link
                href="mailto:repositorio@redscolombia.edu.co"
                className="text-primary underline-offset-4 hover:underline"
              >
                repositorio@redscolombia.edu.co
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
