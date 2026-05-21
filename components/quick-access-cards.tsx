import Link from "next/link";
import { BookOpen, Search, Upload, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    icon: BookOpen,
    title: "Aprender",
    description:
      "Conoce cómo funciona el repositorio y cómo publicar correctamente tu trabajo.",
    href: "/",
  },
  {
    icon: Search,
    title: "Buscar",
    description:
      "Explora recursos digitales por programa academico, autor, fecha o linea tematica.",
    href: "/explorar",
  },
  {
    icon: Upload,
    title: "Publicar",
    description:
      "Sube tu recurso digital en PDF y completa los datos basicos para hacerlo visible.",
    href: "/subir",
  },
  {
    icon: Compass,
    title: "Explorar",
    description:
      "Descubre recursos recientes, destacados y areas de conocimiento.",
    href: "/explorar",
  },
];

export function QuickAccessCards() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.title} href={card.href} className="group block">
              <Card className="h-full cursor-pointer border-border transition-all hover:border-primary/30 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
