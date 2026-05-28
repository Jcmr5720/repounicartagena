"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  FileText,
  Filter,
  Mic,
  MicOff,
  Search,
  Tag,
  User,
  X,
} from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { usePublications } from "@/lib/publications-context";
import { LINEAS_TEMATICAS, PROGRAMAS_ACADEMICOS, type Publication } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicationFavoriteButton } from "@/components/publication-favorite-button";

interface ExplorePageProps {
  initialSearch?: string;
}

export function ExplorePage({ initialSearch = "" }: ExplorePageProps) {
  const { publications, isLoading } = usePublications();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <ExploreContent
      key={initialSearch}
      initialSearch={initialSearch}
      publications={publications}
    />
  );
}

function ExploreContent({
  initialSearch,
  publications,
}: {
  initialSearch: string;
  publications: Publication[];
}) {
  const { programas } = usePublications();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [programaFilter, setProgramaFilter] = useState<string>("");
  const [lineaFilter, setLineaFilter] = useState<string>("");
  const [anioFilter, setAnioFilter] = useState<string>("");
  const {
    clearError,
    error,
    isListening,
    isRecognitionSupported,
    startListening,
    stopListening,
  } = useSpeech();

  const programOptions =
    programas.length > 0
      ? programas
      : PROGRAMAS_ACADEMICOS.map((nombre) => ({ id: nombre, nombre }));

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      !searchQuery ||
      pub.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.palabrasClave.some((kw) =>
        kw.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesPrograma = !programaFilter || pub.programa === programaFilter;
    const matchesLinea = !lineaFilter || pub.lineaTematica === lineaFilter;
    const matchesAnio = !anioFilter || pub.año.toString() === anioFilter;

    return (
      matchesSearch &&
      matchesPrograma &&
      matchesLinea &&
      matchesAnio &&
      pub.status === "disponible"
    );
  });

  const clearFilters = () => {
    setSearchQuery("");
    setProgramaFilter("");
    setLineaFilter("");
    setAnioFilter("");
    clearError();
  };

  const handleVoiceSearch = () => {
    clearError();

    if (isListening) {
      stopListening();
      return;
    }

    startListening({
      onResult: (nextTranscript) => {
        setSearchQuery(nextTranscript);
      },
      onEnd: (finalTranscript) => {
        const normalizedTranscript = finalTranscript.trim();

        if (!normalizedTranscript) {
          return;
        }

        setSearchQuery(normalizedTranscript);
      },
    });
  };

  const hasFilters = searchQuery || programaFilter || lineaFilter || anioFilter;

  const years = Array.from(new Set(publications.map((p) => p.año))).sort(
    (a, b) => b - a,
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Explorar recursos digitales
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Busca y filtra recursos digitales por diferentes criterios
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por titulo, autor o palabra clave..."
                className="h-12 pl-12 pr-14"
              />
              <Button
                type="button"
                size="icon-sm"
                variant={isListening ? "default" : "ghost"}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={handleVoiceSearch}
                disabled={!isRecognitionSupported}
                aria-label={
                  isListening
                    ? "Detener busqueda por voz"
                    : "Iniciar busqueda por voz"
                }
                title={
                  isRecognitionSupported
                    ? "Buscar con voz"
                    : "La busqueda por voz no esta disponible en este navegador"
                }
              >
                {isRecognitionSupported ? (
                  <Mic className={isListening ? "animate-pulse" : undefined} />
                ) : (
                  <MicOff />
                )}
              </Button>
            </div>
            <div className="mt-2 min-h-5 text-sm text-muted-foreground">
              {isListening
                ? "Escuchando... tu busqueda se transcribira automaticamente."
                : error
                  ? error
                  : !isRecognitionSupported
                    ? "La busqueda por voz funciona mejor en Chrome o Edge."
                    : "Usa el microfono para completar la busqueda sin escribir."}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtros:
            </div>

            <Select value={programaFilter} onValueChange={setProgramaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Programa academico" />
              </SelectTrigger>
              <SelectContent>
                {programOptions.map((prog) => (
                  <SelectItem key={prog.id} value={prog.nombre}>
                    {prog.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={lineaFilter} onValueChange={setLineaFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Linea tematica" />
              </SelectTrigger>
              <SelectContent>
                {LINEAS_TEMATICAS.map((linea) => (
                  <SelectItem key={linea} value={linea}>
                    {linea}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={anioFilter} onValueChange={setAnioFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base text-muted-foreground">
                Filtros activos:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {programaFilter && (
                <Badge variant="secondary" className="gap-1">
                  {programaFilter}
                  <button onClick={() => setProgramaFilter("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {lineaFilter && (
                <Badge variant="secondary" className="gap-1">
                  {lineaFilter}
                  <button onClick={() => setLineaFilter("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {anioFilter && (
                <Badge variant="secondary" className="gap-1">
                  {anioFilter}
                  <button onClick={() => setAnioFilter("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        <p className="mb-6 text-base text-muted-foreground">
          {filteredPublications.length} recurso(s) digital(es) encontrado(s)
        </p>

        {filteredPublications.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">
              No se encontraron recursos digitales
            </h3>
            <p className="mt-2 text-base text-muted-foreground">
              Intenta con otros terminos de busqueda o filtros
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPublications.map((publication) => (
              <Card
                key={publication.id}
                className="group flex flex-col overflow-hidden border-border transition-all hover:border-primary/30 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {publication.programa}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {publication.año}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {publication.titulo}
                  </h3>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col pb-4">
                  <div className="mb-3 flex items-center gap-2 text-base text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="truncate">{publication.autor}</span>
                  </div>

                  <p className="mb-4 line-clamp-3 flex-1 text-base text-muted-foreground">
                    {publication.resumen}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {publication.palabrasClave.slice(0, 3).map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        <Tag className="mr-1 h-3 w-3" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(
                        publication.fechaPublicacion ?? publication.created_at,
                      ).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <PublicationFavoriteButton publicationId={publication.id} />
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-primary hover:text-primary"
                      >
                        <Link href={`/publicaciones/${publication.id}`}>
                          Ver detalle
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
