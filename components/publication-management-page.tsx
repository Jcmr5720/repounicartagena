"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  Edit3,
  FileText,
  Filter,
  LayoutGrid,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import { canSuspendDocuments, isAdmin, isModerator } from "@/lib/permissions";
import {
  PROGRAMAS_ACADEMICOS,
  DOCUMENT_STATUS_LABELS,
  LINEAS_TEMATICAS,
  type Publication,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EditFormState = {
  title: string;
  autor: string;
  programa_id: string;
  año: string;
  lineaTematica: string;
  resumen: string;
  palabrasClave: string;
};

const INITIAL_EDIT_FORM: EditFormState = {
  title: "",
  autor: "",
  programa_id: "",
  año: new Date().getFullYear().toString(),
  lineaTematica: "",
  resumen: "",
  palabrasClave: "",
};

function formatDate(value?: string) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Sparkles;
  label: string;
  value: number;
  accent: "primary" | "green" | "amber" | "blue";
}) {
  const accentClasses = {
    primary: "bg-primary/10 text-primary",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-sky-100 text-sky-700",
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses[accent]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-full bg-muted" />
        <div className="h-12 w-full max-w-2xl animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 space-y-3">
              <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-8 w-3/4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="mt-6 flex gap-2">
              <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicationManagementPage() {
  const { user, isLoading } = useAuth();
  const {
    publications,
    programas,
    updatePublication,
    deletePublication,
    isLoading: publicationsLoading,
  } = usePublications();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "disponible" | "suspendido">("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(INITIAL_EDIT_FORM);
  const [savingEdit, setSavingEdit] = useState(false);

  const programOptions =
    programas.length > 0
      ? programas
      : PROGRAMAS_ACADEMICOS.map((nombre) => ({ id: nombre, nombre }));

  const years = useMemo(
    () => Array.from(new Set(publications.map((publication) => publication.año))).sort((a, b) => b - a),
    [publications],
  );

  const filteredPublications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return publications.filter((publication) => {
      const matchesQuery =
        !query ||
        publication.titulo.toLowerCase().includes(query) ||
        publication.autor.toLowerCase().includes(query) ||
        publication.programa.toLowerCase().includes(query) ||
        publication.palabrasClave.some((keyword) => keyword.toLowerCase().includes(query));

      const matchesStatus = statusFilter === "all" || publication.status === statusFilter;
      const matchesProgram = programFilter === "all" || publication.programa_id === programFilter;
      const matchesYear = yearFilter === "all" || publication.año.toString() === yearFilter;

      return matchesQuery && matchesStatus && matchesProgram && matchesYear;
    });
  }, [programFilter, publications, searchQuery, statusFilter, yearFilter]);

  const counts = useMemo(
    () => ({
      total: publications.length,
      available: publications.filter((publication) => publication.status === "disponible").length,
      suspended: publications.filter((publication) => publication.status === "suspendido").length,
      filtered: filteredPublications.length,
    }),
    [filteredPublications.length, publications],
  );

  const openEditDialog = (publication: Publication) => {
    setEditingPublication(publication);
    setEditForm({
      title: publication.titulo,
      autor: publication.autor,
      programa_id: publication.programa_id,
      año: publication.año.toString(),
      lineaTematica: publication.lineaTematica,
      resumen: publication.resumen,
      palabrasClave: publication.palabrasClave.join(", "),
    });
    setErrorMessage("");
  };

  const closeEditDialog = () => {
    setEditingPublication(null);
    setEditForm(INITIAL_EDIT_FORM);
    setSavingEdit(false);
    setErrorMessage("");
  };

  const handleToggleStatus = async (publication: Publication) => {
    if (!canSuspendDocuments(user)) {
      return;
    }

    setUpdatingId(publication.id);
    setErrorMessage("");

    const nextStatus = publication.status === "disponible" ? "suspendido" : "disponible";
    const result = await updatePublication(publication.id, {
      status: nextStatus,
      estado: nextStatus,
    });

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo actualizar el estado del documento");
    }

    setUpdatingId(null);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingPublication) {
      return;
    }

    const yearValue = Number.parseInt(editForm.año, 10);
    if (!Number.isFinite(yearValue)) {
      setErrorMessage("El año del documento es obligatorio");
      return;
    }

    setSavingEdit(true);
    setErrorMessage("");

    const result = await updatePublication(editingPublication.id, {
      title: editForm.title.trim(),
      titulo: editForm.title.trim(),
      autor: editForm.autor.trim(),
      programa_id: editForm.programa_id,
      año: yearValue,
      lineaTematica: editForm.lineaTematica.trim(),
      description: editForm.resumen.trim(),
      resumen: editForm.resumen.trim(),
      palabrasClave: editForm.palabrasClave
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    });

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo actualizar el documento");
      setSavingEdit(false);
      return;
    }

    closeEditDialog();
  };

  const handleDelete = async () => {
    if (!deletingId) {
      return;
    }

    const targetId = deletingId;
    setErrorMessage("");

    const result = await deletePublication(targetId);
    if (!result.success) {
      setErrorMessage(result.error || "No se pudo eliminar el documento");
      setDeletingId(null);
      return;
    }

    if (editingPublication?.id === targetId) {
      closeEditDialog();
    }

    setDeletingId(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setProgramFilter("all");
    setYearFilter("all");
  };

  const hasFilters =
    searchQuery.trim() ||
    statusFilter !== "all" ||
    programFilter !== "all" ||
    yearFilter !== "all";

  if (isLoading || publicationsLoading) {
    return <LoadingSkeleton />;
  }

  if (!user || !(isAdmin(user) || isModerator(user))) {
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
                  Vista privada
                </Badge>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Acceso restringido
                </h2>
                <p className="mt-3 max-w-xl text-base text-muted-foreground">
                  Solo moderadores y administradores pueden acceder a esta vista.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link href="/moderacion">Ir a moderación</Link>
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

  const roleLabel = isAdmin(user) ? "Administrador" : "Moderador";

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,95,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Vista interna
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3.5 w-3.5" />
                {roleLabel}
              </Badge>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Gestión de publicaciones
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Busca, filtra y actúa sobre todas las publicaciones del proyecto en una sola vista,
              con una lectura más clara y controles agrupados por prioridad.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="shadow-sm">
              <Link href={isAdmin(user) ? "/admin" : "/moderacion"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button asChild className="shadow-sm">
              <Link href="/subir">
                Subir documento
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-800 shadow-sm dark:text-red-300">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard icon={FileText} label="Total" value={counts.total} accent="primary" />
          <StatCard icon={BookOpen} label="Disponibles" value={counts.available} accent="green" />
          <StatCard icon={RefreshCw} label="Suspendidos" value={counts.suspended} accent="amber" />
          <StatCard icon={LayoutGrid} label="Resultados" value={counts.filtered} accent="blue" />
        </div>

        <Card className="mb-8 overflow-hidden border-border/70 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
          <CardContent className="p-6 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Filtros y búsqueda
                </h2>
                <p className="text-sm text-muted-foreground">
                  Filtra por estado, programa o año y acota por texto cuando necesites encontrar algo rápido.
                </p>
              </div>
              {hasFilters ? (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <Filter className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
              <div className="space-y-2 lg:col-span-1">
                <Label htmlFor="search-publications">Buscar</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search-publications"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Título, autor, programa o palabra clave"
                    className="h-12 rounded-xl pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Programa</Label>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {programOptions.map((programa) => (
                      <SelectItem key={programa.id} value={programa.id}>
                        {programa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Año</Label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Resultados
            </h2>
            <p className="text-sm text-muted-foreground">
              {counts.filtered} publicación{counts.filtered === 1 ? "" : "es"} coinciden con los filtros actuales.
            </p>
          </div>
          {hasFilters ? (
            <div className="flex flex-wrap gap-2">
              {searchQuery.trim() ? <Badge variant="secondary">Búsqueda: {searchQuery}</Badge> : null}
              {statusFilter !== "all" ? <Badge variant="secondary">Estado: {statusFilter}</Badge> : null}
              {programFilter !== "all" ? <Badge variant="secondary">Programa activo</Badge> : null}
              {yearFilter !== "all" ? <Badge variant="secondary">Año: {yearFilter}</Badge> : null}
            </div>
          ) : null}
        </div>

        {filteredPublications.length === 0 ? (
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                No hay publicaciones que coincidan con los filtros
              </h3>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Prueba ajustar la búsqueda, cambiar el programa o volver a todos los estados para encontrar resultados.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button onClick={clearFilters}>Limpiar filtros</Button>
                <Button asChild variant="outline">
                  <Link href="/explorar">Ir a explorar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredPublications.map((publication) => {
              const canEdit = isAdmin(user);
              const canModerate = canSuspendDocuments(user);

              return (
                <Card
                  key={publication.id}
                  className="group overflow-hidden border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary opacity-80" />
                  <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={publication.status === "disponible" ? "default" : "secondary"}
                            className={publication.status === "disponible" ? "bg-emerald-100 text-emerald-700" : ""}
                          >
                            {DOCUMENT_STATUS_LABELS[publication.status]}
                          </Badge>
                          <Badge variant="outline">{publication.año}</Badge>
                        </div>
                        <CardTitle className="text-balance text-2xl leading-tight">
                          {publication.titulo}
                        </CardTitle>
                      </div>
                    </div>

                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {publication.resumen}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>
                          <span className="font-medium text-foreground">Autor:</span> {publication.autor}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>
                          <span className="font-medium text-foreground">Programa:</span> {publication.programa}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>
                          <span className="font-medium text-foreground">Línea:</span> {publication.lineaTematica}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>
                          <span className="font-medium text-foreground">Actualizado:</span>{" "}
                          {formatDate(publication.updated_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {publication.palabrasClave.slice(0, 5).map((keyword) => (
                        <Badge key={keyword} variant="outline" className="rounded-full px-3 py-1">
                          {keyword}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <Link href={`/publicaciones/${publication.id}`}>
                            Ver detalle
                          </Link>
                        </Button>

                        {publication.pdfUrl ? (
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <Link href={publication.pdfUrl} target="_blank" rel="noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Descargar PDF
                            </Link>
                          </Button>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={publication.status === "disponible" ? "secondary" : "default"}
                          onClick={() => handleToggleStatus(publication)}
                          disabled={updatingId === publication.id || !canModerate}
                          className="rounded-full"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {publication.status === "disponible" ? "Suspender" : "Reactivar"}
                        </Button>

                        {canEdit ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(publication)}
                              className="rounded-full"
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeletingId(publication.id)}
                              className="rounded-full"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={Boolean(editingPublication)} onOpenChange={(open) => (!open ? closeEditDialog() : null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar publicación</DialogTitle>
            <DialogDescription>
              Actualiza la información del documento sin cambiar el archivo PDF.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4 pt-2" onSubmit={handleEditSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-autor">Autor</Label>
                <Input
                  id="edit-autor"
                  value={editForm.autor}
                  onChange={(event) => setEditForm({ ...editForm, autor: event.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-anio">Año</Label>
                <Input
                  id="edit-anio"
                  type="number"
                  value={editForm.año}
                  onChange={(event) => setEditForm({ ...editForm, año: event.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-programa">Programa</Label>
                <Select
                  value={editForm.programa_id}
                  onValueChange={(value) => setEditForm({ ...editForm, programa_id: value })}
                >
                  <SelectTrigger id="edit-programa">
                    <SelectValue placeholder="Selecciona un programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programOptions.map((programa) => (
                      <SelectItem key={programa.id} value={programa.id}>
                        {programa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-linea">Línea temática</Label>
                <Select
                  value={editForm.lineaTematica}
                  onValueChange={(value) => setEditForm({ ...editForm, lineaTematica: value })}
                >
                  <SelectTrigger id="edit-linea">
                    <SelectValue placeholder="Selecciona una línea" />
                  </SelectTrigger>
                  <SelectContent>
                    {LINEAS_TEMATICAS.map((linea) => (
                      <SelectItem key={linea} value={linea}>
                        {linea}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-resumen">Resumen</Label>
                <Textarea
                  id="edit-resumen"
                  rows={4}
                  value={editForm.resumen}
                  onChange={(event) => setEditForm({ ...editForm, resumen: event.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-keywords">Palabras clave</Label>
                <Input
                  id="edit-keywords"
                  value={editForm.palabrasClave}
                  onChange={(event) =>
                    setEditForm({ ...editForm, palabrasClave: event.target.value })
                  }
                  placeholder="Separadas por coma"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingEdit}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => (!open ? setDeletingId(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar publicación</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La publicación quedará eliminada por completo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
