import { BookOpen, Search, Upload, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickAccessCardsProps {
  onNavigate: (page: string) => void;
}

const cards = [
  {
    icon: BookOpen,
    title: "Aprender",
    description:
      "Conoce cómo funciona el repositorio y cómo publicar correctamente tu trabajo.",
    action: "inicio",
  },
  {
    icon: Search,
    title: "Buscar",
    description:
      "Explora proyectos por programa académico, autor, fecha o línea temática.",
    action: "explorar",
  },
  {
    icon: Upload,
    title: "Publicar",
    description:
      "Sube tu proyecto en PDF y completa los datos básicos para hacerlo visible.",
    action: "subir",
  },
  {
    icon: Compass,
    title: "Explorar",
    description:
      "Descubre trabajos recientes, destacados y áreas de conocimiento.",
    action: "explorar",
  },
];

export function QuickAccessCards({ onNavigate }: QuickAccessCardsProps) {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card
              key={card.title}
              className="group cursor-pointer border-border transition-all hover:border-primary/30 hover:shadow-md"
              onClick={() => onNavigate(card.action)}
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
