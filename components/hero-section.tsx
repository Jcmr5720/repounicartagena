"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-muted/50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
            Repositorio de Recursos Digitales
          </div>

          {/* Title */}
          <h1 className="mx-auto max-w-4xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Consulta, publica y preserva{" "}
            <span className="text-primary">recursos digitales</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Un espacio digital para reunir recursos digitales, informes,
            guias y materiales desarrollados por la comunidad UniCartagena.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por titulo, autor, programa, palabra clave o anio..."
                  className="h-14 pl-12 pr-4 text-base shadow-sm"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 text-base shadow-sm"
              >
                <Search className="mr-2 h-5 w-5" />
                Buscar
              </Button>
            </div>
          </form>

          {/* Advanced search link */}
          <Link
            href="/explorar"
            className="mt-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Búsqueda avanzada
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground sm:text-3xl">500+</div>
              <div className="text-sm text-muted-foreground">REDS publicados</div>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground sm:text-3xl">18</div>
              <div className="text-sm text-muted-foreground">Programas académicos</div>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground sm:text-3xl">1827</div>
              <div className="text-sm text-muted-foreground">Año de fundación</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
