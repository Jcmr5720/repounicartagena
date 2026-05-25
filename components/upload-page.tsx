"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Edit3,
  Trash2,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import {
  PROGRAMAS_ACADEMICOS,
  LINEAS_TEMATICAS,
  type Publication,
  DOCUMENT_STATUS_LABELS,
} from "@/lib/types";
import {
  canDeleteDocument,
  canEditDocument,
  canManageDocuments,
} from "@/lib/permissions";

type FormState = {
  titulo: string;
  autor: string;
  programa: string;
  año: string;
  lineaTematica: string;
  resumen: string;
  palabrasClave: string;
};

const INITIAL_FORM: FormState = {
  titulo: "",
  autor: "",
  programa: "",
  año: new Date().getFullYear().toString(),
  lineaTematica: "",
  resumen: "",
  palabrasClave: "",
};

export function UploadPage() {
  const { user, isLoading } = useAuth();
  const {
    publications,
    programas,
    addPublication,
    updatePublication,
    deletePublication,
    isLoading: publicationsLoading,
    refreshPublications,
  } = usePublications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const programOptions =
    programas.length > 0
      ? programas
      : PROGRAMAS_ACADEMICOS.map((nombre) => ({ id: nombre, nombre }));

  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (editingPublication) {
      setFormData({
        titulo: editingPublication.titulo,
        autor: editingPublication.autor,
        programa: editingPublication.programa_id,
        año: editingPublication.año.toString(),
        lineaTematica: editingPublication.lineaTematica,
        resumen: editingPublication.resumen,
        palabrasClave: editingPublication.palabrasClave.join(", "),
      });
      setSelectedFile(null);
      setSubmitStatus(null);
      setMessage("");
    }
  }, [editingPublication]);

  const manageablePublications = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "admin") {
      return publications;
    }

    return publications.filter((publication) => publication.owner_id === user.id);
  }, [publications, user]);

  if (isLoading || publicationsLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Acceso requerido
            </h2>
            <p className="mb-6 text-muted-foreground">
              Debes iniciar sesión para subir y administrar documentos.
            </p>
            <Button asChild>
              <Link href="/auth">Iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canManageDocuments(user)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              No tienes permisos para subir documentos
            </h2>
            <p className="text-muted-foreground">
              Tu rol actual solo puede ver y moderar documentos. Si necesitas
              cargar contenido, pide que te asignen el rol adecuado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resetForm = () => {
    setEditingPublication(null);
    setFormData(INITIAL_FORM);
    setSelectedFile(null);
    setSubmitStatus(null);
    setMessage("");
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        setMessage("Solo se permiten archivos PDF");
        setSubmitStatus("error");
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setMessage("");

    const payload = {
      titulo: formData.titulo.trim(),
      autor: formData.autor.trim(),
      programa: formData.programa.trim(),
      año: parseInt(formData.año, 10),
      lineaTematica: formData.lineaTematica.trim(),
      resumen: formData.resumen.trim(),
      palabrasClave: formData.palabrasClave
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    };

    try {
      if (editingPublication) {
        if (selectedFile) {
          const uploadResult = await addPublication({
            document_id: editingPublication.id,
            title: payload.titulo,
            description: payload.resumen,
            autor: payload.autor,
            programa_id: payload.programa,
            anio: payload.año,
            lineaTematica: payload.lineaTematica,
            palabrasClave: payload.palabrasClave,
            file: selectedFile,
          });

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || "No se pudo reemplazar el archivo");
          }
        } else {
          const updates: Partial<Publication> = {
            title: payload.titulo,
            titulo: payload.titulo,
            autor: payload.autor,
            programa_id: payload.programa,
            año: payload.año,
            lineaTematica: payload.lineaTematica,
            description: payload.resumen,
            resumen: payload.resumen,
            palabrasClave: payload.palabrasClave,
          };

          const updateResult = await updatePublication(editingPublication.id, updates);
          if (!updateResult.success) {
            throw new Error(updateResult.error || "No se pudo actualizar el documento");
          }
        }

        setSubmitStatus("success");
        setMessage("Documento actualizado correctamente.");
      } else {
        if (!selectedFile) {
          throw new Error("Debes seleccionar un archivo PDF");
        }

        const result = await addPublication({
          title: payload.titulo,
          description: payload.resumen,
          autor: payload.autor,
          programa_id: payload.programa,
          año: payload.año,
          lineaTematica: payload.lineaTematica,
          palabrasClave: payload.palabrasClave,
          file: selectedFile,
        });

        if (!result.success) {
          throw new Error(result.error || "No se pudo publicar el documento");
        }

        setSubmitStatus("success");
        setMessage("Documento publicado correctamente.");
      }

      resetForm();
      await refreshPublications();
    } catch (error) {
      setSubmitStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el documento");
    }

    setIsSubmitting(false);
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    const targetId = deleteId;
    setIsSubmitting(true);
    setMessage("");
    setSubmitStatus(null);

    const result = await deletePublication(targetId);
    if (!result.success) {
      setSubmitStatus("error");
      setMessage(result.error || "No se pudo eliminar el documento");
      setIsSubmitting(false);
      return;
    }

    setSubmitStatus("success");
    setMessage("Documento eliminado correctamente.");
    setDeleteId(null);
    if (editingPublication?.id === targetId) {
      resetForm();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {editingPublication ? "Editar documento" : "Subir documento"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {editingPublication
              ? "Actualiza la informaci\u00f3n del documento y, si lo necesitas, reemplaza el PDF."
              : "Completa el formulario para publicar un recurso digital."}
          </p>
        </div>
        {editingPublication ? (
          <Button variant="outline" onClick={resetForm}>
            Cancelar edición
          </Button>
        ) : null}
      </div>

      {submitStatus === "success" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <span>{message || "Operación completada correctamente."}</span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{message || "No se pudo completar la operación."}</span>
        </div>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Información del recurso digital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título del recurso digital *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                placeholder="Ingresa el título del recurso digital"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autor">Autor(es) *</Label>
              <Input
                id="autor"
                value={formData.autor}
                onChange={(e) =>
                  setFormData({ ...formData, autor: e.target.value })
                }
                placeholder="Nombre del autor o autores"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="programa">Programa académico *</Label>
              <select
                id="programa"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.programa}
                onChange={(e) =>
                  setFormData({ ...formData, programa: e.target.value })
                }
                required
              >
                <option value="">Selecciona programa</option>
                {programOptions.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="año">Año *</Label>
              <select
                id="año"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.año}
                onChange={(e) =>
                  setFormData({ ...formData, año: e.target.value })
                }
                required
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="lineaTematica">Línea temática *</Label>
              <select
                id="lineaTematica"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.lineaTematica}
                onChange={(e) =>
                  setFormData({ ...formData, lineaTematica: e.target.value })
                }
                required
              >
                <option value="">Selecciona línea temática</option>
                {LINEAS_TEMATICAS.map((linea) => (
                  <option key={linea} value={linea}>
                    {linea}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="resumen">Resumen *</Label>
              <Textarea
                id="resumen"
                value={formData.resumen}
                onChange={(e) =>
                  setFormData({ ...formData, resumen: e.target.value })
                }
                placeholder="Escribe un resumen del recurso digital (máximo 500 caracteres)"
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.resumen.length}/500 caracteres
              </p>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="palabrasClave">Palabras clave *</Label>
              <Input
                id="palabrasClave"
                value={formData.palabrasClave}
                onChange={(e) =>
                  setFormData({ ...formData, palabrasClave: e.target.value })
                }
                placeholder="Separa las palabras clave con comas"
                required
              />
              <p className="text-xs text-muted-foreground">
                Ejemplo: tecnología, educación, innovación
              </p>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Archivo PDF {editingPublication ? "(opcional)" : "*"}</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 font-medium text-foreground">
                      Haz clic para seleccionar un archivo PDF
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {editingPublication
                        ? "Si no eliges uno nuevo, se conserva el PDF actual."
                        : "o arrastra y suelta aquí"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full lg:col-span-2"
              disabled={
                isSubmitting ||
                !formData.titulo ||
                !formData.autor ||
                !formData.programa ||
                !formData.lineaTematica ||
                !formData.resumen ||
                !formData.palabrasClave ||
                (!selectedFile && !editingPublication)
              }
            >
              {isSubmitting
                ? editingPublication
                  ? "Guardando cambios..."
                  : "Publicando..."
                : editingPublication
                  ? "Guardar cambios"
                  : "Publicar documento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            {user.role === "admin" ? "Todos los documentos" : "Mis documentos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {manageablePublications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aún no tienes documentos registrados
            </div>
          ) : (
            <div className="space-y-4">
              {manageablePublications.map((publication) => (
                <div
                  key={publication.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-foreground line-clamp-1">
                        {publication.titulo}
                      </h4>
                      <Badge variant={publication.status === "disponible" ? "default" : "secondary"}>
                        {DOCUMENT_STATUS_LABELS[publication.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {publication.autor} • {publication.programa} • {publication.año}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEditDocument(user, publication) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(publication)}
                        className="gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Button>
                    ) : null}
                    {canDeleteDocument(user, publication) ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(publication.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El documento será eliminado
              permanentemente del repositorio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
