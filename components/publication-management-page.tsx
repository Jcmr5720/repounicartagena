"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Edit3,
  FileText,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
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

      const matchesStatus =
        statusFilter === "all" || publication.status === statusFilter;

      const matchesProgram =
        programFilter === "all" || publication.programa_id === programFilter;

      const matchesYear =
        yearFilter === "all" || publication.año.toString() === yearFilter;

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

  if (isLoading || publicationsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!user || !(isAdmin(user) || isModerator(user))) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Acceso restringido
            </h2>
            <p className="text-muted-foreground">
              Solo moderadores y administradores pueden acceder a esta vista.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleLabel = isAdmin(user) ? "Administrador" : "Moderador";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Vista interna
            </Badge>
            <Badge variant="outline">{roleLabel}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion de publicaciones
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Busca, filtra y actua sobre todas las publicaciones del proyecto desde una sola vista.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={isAdmin(user) ? "/admin" : "/moderacion"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href="/subir">
              Subir documento
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{counts.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Disponibles</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{counts.available}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Suspendidos</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{counts.suspended}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Resultados</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{counts.filtered}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 border-border">
        <CardContent className="p-6">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="search-publications">Buscar</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search-publications"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Titulo, autor, programa o palabra clave"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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

            <div className="flex items-end">
              {hasFilters ? (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <Filter className="h-4 w-4" />
                  Limpiar
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredPublications.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-4 h-12 w-12" />
            <p>No hay publicaciones que coincidan con los filtros actuales.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredPublications.map((publication) => (
            <Card key={publication.id} className="border-border">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={publication.status === "disponible" ? "default" : "secondary"}
                        className={publication.status === "disponible" ? "bg-green-100 text-green-800" : ""}
                      >
                        {DOCUMENT_STATUS_LABELS[publication.status]}
                      </Badge>
                      <Badge variant="outline">{publication.año}</Badge>
                    </div>
                    <CardTitle className="text-balance text-xl">
                      {publication.titulo}
                    </CardTitle>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {publication.resumen}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-foreground">Autor:</span>{" "}
                    {publication.autor}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Programa:</span>{" "}
                    {publication.programa}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Linea:</span>{" "}
                    {publication.lineaTematica}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Actualizado:</span>{" "}
                    {formatDate(publication.updated_at)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {publication.palabrasClave.slice(0, 4).map((keyword) => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/publicaciones/${publication.id}`}>
                      Ver detalle
                    </Link>
                  </Button>

                  {publication.pdfUrl ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={publication.pdfUrl} target="_blank" rel="noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Link>
                    </Button>
                  ) : null}

                  <Button
                    size="sm"
                    variant={publication.status === "disponible" ? "secondary" : "default"}
                    onClick={() => handleToggleStatus(publication)}
                    disabled={updatingId === publication.id || !canSuspendDocuments(user)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {publication.status === "disponible" ? "Suspender" : "Reactivar"}
                  </Button>

                  {isAdmin(user) ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(publication)}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingId(publication.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(editingPublication)} onOpenChange={(open) => (!open ? closeEditDialog() : null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar publicacion</DialogTitle>
            <DialogDescription>
              Actualiza la informacion del documento sin cambiar el archivo PDF.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4 pt-2" onSubmit={handleEditSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-title">Titulo</Label>
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
                <Label htmlFor="edit-linea">Linea tematica</Label>
                <Select
                  value={editForm.lineaTematica}
                  onValueChange={(value) => setEditForm({ ...editForm, lineaTematica: value })}
                >
                  <SelectTrigger id="edit-linea">
                    <SelectValue placeholder="Selecciona una linea" />
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
            <AlertDialogTitle>Eliminar publicacion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. La publicacion quedara eliminada por completo.
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
