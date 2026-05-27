"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  FileText,
  PlusCircle,
  ShieldAlert,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { PublicationWorkflowTimeline } from "@/components/publication-workflow-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  canDeleteDocument,
  canEditDocument,
  canManageDocuments,
  canSubmitForReview,
} from "@/lib/permissions";
import { usePublications } from "@/lib/publications-context";
import {
  DOCUMENT_STATUS_LABELS,
  EVALUATION_DECISION_LABELS,
  LINEAS_TEMATICAS,
  PROGRAMAS_ACADEMICOS,
  PUBLICATION_WORKFLOW_STATUS_LABELS,
  type Publication,
} from "@/lib/types";

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
    applyWorkflowAction,
    updatePublication,
    deletePublication,
    getLatestEvaluationForPublication,
    getLatestWorkflowCommentForPublication,
    getWorkflowEventsForPublication,
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
  const [submitMode, setSubmitMode] = useState<"draft" | "review">("draft");
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!editingPublication) {
      return;
    }

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
              Debes iniciar sesion para subir y administrar documentos.
            </p>
            <Button asChild>
              <Link href="/auth">Iniciar sesion</Link>
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
              Este espacio esta reservado para estudiantes y administradores.
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
    setSubmitMode("draft");
    setSubmitStatus(null);
    setMessage("");
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Solo se permiten archivos PDF");
      setSubmitStatus("error");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
            workflow_status: editingPublication.workflow_status,
            file: selectedFile,
          });

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || "No se pudo reemplazar el archivo");
          }
        } else {
          const updateResult = await updatePublication(editingPublication.id, {
            title: payload.titulo,
            titulo: payload.titulo,
            autor: payload.autor,
            programa_id: payload.programa,
            año: payload.año,
            lineaTematica: payload.lineaTematica,
            description: payload.resumen,
            resumen: payload.resumen,
            palabrasClave: payload.palabrasClave,
          });

          if (!updateResult.success) {
            throw new Error(updateResult.error || "No se pudo actualizar el documento");
          }
        }

        if (submitMode === "review" && canSubmitForReview(user, editingPublication)) {
          const transitionResult = await applyWorkflowAction(
            editingPublication.id,
            "submit_for_review",
          );

          if (!transitionResult.success) {
            throw new Error(
              transitionResult.error || "No se pudo enviar la publicacion a revision",
            );
          }
        }

        setSubmitStatus("success");
        setMessage(
          submitMode === "review"
            ? "Documento actualizado y enviado a revision."
            : "Documento actualizado correctamente.",
        );
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
          workflow_status: "borrador",
          file: selectedFile,
        });

        if (!result.success) {
          throw new Error(result.error || "No se pudo guardar el documento");
        }

        if (submitMode === "review" && result.documentId) {
          const transitionResult = await applyWorkflowAction(
            result.documentId,
            "submit_for_review",
          );

          if (!transitionResult.success) {
            throw new Error(
              transitionResult.error || "No se pudo enviar la publicacion a revision",
            );
          }
        }

        setSubmitStatus("success");
        setMessage(
          submitMode === "review"
            ? "Documento creado y enviado a revision."
            : "Documento guardado como borrador.",
        );
      }

      resetForm();
      await refreshPublications();
    } catch (error) {
      setSubmitStatus("error");
      setMessage(
        error instanceof Error ? error.message : "No se pudo completar la operacion",
      );
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

    setIsSubmitting(true);
    setMessage("");
    setSubmitStatus(null);

    const result = await deletePublication(deleteId);
    if (!result.success) {
      setSubmitStatus("error");
      setMessage(result.error || "No se pudo eliminar el documento");
      setIsSubmitting(false);
      return;
    }

    setSubmitStatus("success");
    setMessage("Documento eliminado correctamente.");
    setDeleteId(null);
    if (editingPublication?.id === deleteId) {
      resetForm();
    }
    setIsSubmitting(false);
  };

  const handleSendToReview = async (publication: Publication) => {
    setMessage("");
    setSubmitStatus(null);

    const result = await applyWorkflowAction(publication.id, "submit_for_review");
    if (!result.success) {
      setSubmitStatus("error");
      setMessage(result.error || "No se pudo enviar la publicacion a revision");
      return;
    }

    setSubmitStatus("success");
    setMessage("La publicacion fue enviada a revision docente.");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {editingPublication ? "Editar publicacion" : "Subir documento"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {editingPublication
              ? "Actualiza el recurso y decide si quieres mantenerlo en trabajo o enviarlo a revision."
              : "Guarda tu trabajo como borrador o envialo directamente a revision docente."}
          </p>
        </div>
        {editingPublication ? (
          <Button variant="outline" onClick={resetForm}>
            Cancelar edicion
          </Button>
        ) : null}
      </div>

      {submitStatus === "success" ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <span>{message || "Operacion completada correctamente."}</span>
        </div>
      ) : null}

      {submitStatus === "error" ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{message || "No se pudo completar la operacion."}</span>
        </div>
      ) : null}

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Informacion del recurso digital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Titulo del recurso digital *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(event) =>
                  setFormData({ ...formData, titulo: event.target.value })
                }
                placeholder="Ingresa el titulo del recurso digital"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autor">Autor(es) *</Label>
              <Input
                id="autor"
                value={formData.autor}
                onChange={(event) =>
                  setFormData({ ...formData, autor: event.target.value })
                }
                placeholder="Nombre del autor o autores"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="programa">Programa academico *</Label>
              <select
                id="programa"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.programa}
                onChange={(event) =>
                  setFormData({ ...formData, programa: event.target.value })
                }
                required
              >
                <option value="">Selecciona programa</option>
                {programOptions.map((programa) => (
                  <option key={programa.id} value={programa.id}>
                    {programa.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio">Año *</Label>
              <select
                id="anio"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.año}
                onChange={(event) =>
                  setFormData({ ...formData, año: event.target.value })
                }
                required
              >
                {Array.from({ length: 10 }, (_, index) => {
                  const year = new Date().getFullYear() - index;
                  return (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="lineaTematica">Linea tematica *</Label>
              <select
                id="lineaTematica"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.lineaTematica}
                onChange={(event) =>
                  setFormData({ ...formData, lineaTematica: event.target.value })
                }
                required
              >
                <option value="">Selecciona linea tematica</option>
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
                onChange={(event) =>
                  setFormData({ ...formData, resumen: event.target.value })
                }
                placeholder="Escribe un resumen del recurso digital"
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
                onChange={(event) =>
                  setFormData({ ...formData, palabrasClave: event.target.value })
                }
                placeholder="Separa las palabras clave con comas"
                required
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>
                Archivo PDF {editingPublication ? "(opcional)" : "*"}
              </Label>
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
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
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
                        : "Tambien puedes guardarlo primero como borrador."}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <Button
                type="submit"
                variant="outline"
                className="flex-1"
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
                onClick={() => setSubmitMode("draft")}
              >
                {isSubmitting && submitMode === "draft"
                  ? "Guardando..."
                  : "Guardar borrador"}
              </Button>
              <Button
                type="submit"
                className="flex-1"
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
                onClick={() => setSubmitMode("review")}
              >
                {isSubmitting && submitMode === "review"
                  ? "Enviando..."
                  : "Guardar y enviar a revision"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            {user.role === "admin" ? "Todas las publicaciones" : "Mis publicaciones"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {manageablePublications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aun no tienes publicaciones registradas.
            </div>
          ) : (
            <div className="space-y-4">
              {manageablePublications.map((publication) => {
                const latestComment = getLatestWorkflowCommentForPublication(publication.id);
                const latestEvaluation = getLatestEvaluationForPublication(publication.id);
                const workflowEvents = getWorkflowEventsForPublication(publication.id).slice(0, 3);

                return (
                  <div
                    key={publication.id}
                    className="rounded-2xl border border-border p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-foreground">
                            {publication.titulo}
                          </h4>
                          <Badge variant="outline">
                            {
                              PUBLICATION_WORKFLOW_STATUS_LABELS[
                                publication.workflow_status
                              ]
                            }
                          </Badge>
                          <Badge
                            variant={
                              publication.status === "disponible"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {DOCUMENT_STATUS_LABELS[publication.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {publication.autor} • {publication.programa} • {publication.año}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Observacion mas reciente:
                          </span>{" "}
                          {latestComment?.comments || "Todavia no hay observaciones."}
                        </p>
                        {latestEvaluation &&
                        ["ajustes_solicitados", "rechazada"].includes(
                          publication.workflow_status,
                        ) ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            <p className="font-medium">
                              Retroalimentacion de evaluacion
                            </p>
                            <p className="mt-1">
                              Puntaje total: {latestEvaluation.total_score ?? "Sin total"}/20
                            </p>
                            <p>
                              Concepto final:{" "}
                              {latestEvaluation.decision
                                ? EVALUATION_DECISION_LABELS[latestEvaluation.decision]
                                : "Sin concepto final"}
                            </p>
                            <p>
                              Fortalezas:{" "}
                              {latestEvaluation.strengths || "Sin fortalezas registradas."}
                            </p>
                            <p>
                              Mejoras:{" "}
                              {latestEvaluation.improvements || "Sin mejoras registradas."}
                            </p>
                            <p>
                              Observaciones:{" "}
                              {latestEvaluation.comments || "Sin observaciones generales."}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {canSubmitForReview(user, publication) ? (
                          <Button
                            size="sm"
                            onClick={() => void handleSendToReview(publication)}
                          >
                            Enviar a revision
                          </Button>
                        ) : null}
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

                    <div className="mt-4">
                      <PublicationWorkflowTimeline
                        events={workflowEvents}
                        emptyMessage="Esta publicacion aun no registra eventos."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar publicacion?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. La publicacion sera eliminada
              permanentemente del repositorio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
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
