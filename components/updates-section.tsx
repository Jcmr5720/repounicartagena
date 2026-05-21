import { Bell, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UPDATES } from "@/lib/types";

export function UpdatesSection() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5 text-primary" />
              Actualizaciones del repositorio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {UPDATES.map((update) => (
                <li key={update.id}>
                  <button className="group flex w-full items-center justify-between py-4 text-left transition-colors hover:text-primary">
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary">
                        {update.titulo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {update.fecha}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
