"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Send,
  ShieldAlert,
  Upload,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { canManageDocuments, canSubmitForReview } from "@/lib/permissions";
import { usePublications } from "@/lib/publications-context";
import {
  getLineasTematicasByPrograma,
  PROGRAMAS_ACADEMICOS,
  type Publication,
} from "@/lib/types";

type FormState = {
  titulo: string;
  autor: string;
  programa: string;
  lineaId: string;
  anio: string;
  lineaTematica: string;
  resumen: string;
  palabrasClave: string;
};

const INITIAL_FORM: FormState = {
  titulo: "",
  autor: "",
  programa: "",
  lineaId: "",
  anio: new Date().getFullYear().toString(),
  lineaTematica: "",
  resumen: "",
  palabrasClave: "",
};

const SELECT_CLASS =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function UploadPage() {
  const { user, isLoading } = useAuth();
  const {
    publications,
    programas,
    lineas,
    addPublication,
    applyWorkflowAction,
    updatePublication,
    isLoading: publicationsLoading,
    refreshPublications,
  } = usePublications();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draftsOpen, setDraftsOpen] = useState(false);

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

  useEffect(() => {
    if (!editingPublication) return;
    setFormData({
      titulo: editingPublication.titulo,
      autor: editingPublication.autor,
      programa: editingPublication.programa_id,
      lineaId: editingPublication.linea_id,
      anio: editingPublication.año.toString(),
      lineaTematica: editingPublication.lineaTematica,
      resumen: editingPublication.resumen,
      palabrasClave: editingPublication.palabrasClave.join(", "),
    });
    setSelectedFile(null);
    setSubmitStatus(null);
    setMessage("");
  }, [editingPublication]);

  const selectedProgramName = useMemo(
    () => programOptions.find((program) => program.id === formData.programa)?.nombre ?? "",
    [formData.programa, programOptions],
  );

  const thematicLineOptions = useMemo(() => {
    if (!formData.programa) {
      return [];
    }

    if (lineas.length > 0) {
      return lineas
        .filter((linea) => linea.programa_id === formData.programa)
        .sort((left, right) => left.nombre.localeCompare(right.nombre, "es"));
    }

    return getLineasTematicasByPrograma(selectedProgramName).map((nombre) => ({
      id: nombre,
      programa_id: formData.programa,
      nombre,
      slug: nombre.toLowerCase(),
    }));
  }, [formData.programa, lineas, selectedProgramName]);

  const manageablePublications = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return publications;
    return publications.filter((p) => p.owner_id === user.id);
  }, [publications, user]);

  const editablePublications = useMemo(
    () =>
      manageablePublications.filter((p) =>
        ["borrador", "ajustes_solicitados"].includes(p.workflow_status),
      ),
    [manageablePublications],
  );

  useEffect(() => {
    const publicationId = searchParams.get("publicationId");
    if (!publicationId || manageablePublications.length === 0) return;
    const publication = manageablePublications.find((item) => item.id === publicationId);
    if (publication) setEditingPublication(publication);
  }, [manageablePublications, searchParams]);

  /* ── Guards ── */
  if (isLoading || publicationsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-base font-semibold">Acceso requerido</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Debes iniciar sesión para gestionar publicaciones.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!canManageDocuments(user)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="mb-1 text-base font-semibold">Sin permisos</h2>
          <p className="text-sm text-muted-foreground">
            Este espacio está reservado para docentes y administradores.
          </p>
        </div>
      </div>
    );
  }

  /* ── Helpers ── */
  const resetForm = () => {
    setEditingPublication(null);
    setFormData(INITIAL_FORM);
    setSelectedFile(null);
    setSubmitMode("draft");
    setSubmitStatus(null);
    setMessage("");
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      setMessage("Solo se permiten archivos PDF.");
      setSubmitStatus("error");
      return;
    }
    setSelectedFile(file);
    setSubmitStatus(null);
    setMessage("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleProgramChange = (programaId: string) => {
    setFormData((current) => ({
      ...current,
      programa: programaId,
      lineaId: "",
      lineaTematica: "",
    }));
  };

  const handleThematicLineChange = (lineaId: string) => {
    const selectedLine = thematicLineOptions.find((linea) => linea.id === lineaId);
    setFormData((current) => ({
      ...current,
      lineaId,
      lineaTematica: selectedLine?.nombre ?? "",
    }));
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
      lineaId: formData.lineaId.trim(),
      anio: parseInt(formData.anio, 10),
      lineaTematica: formData.lineaTematica.trim(),
      resumen: formData.resumen.trim(),
      palabrasClave: formData.palabrasClave.split(",").map((k) => k.trim()).filter(Boolean),
    };

    try {
      if (editingPublication) {
        if (selectedFile) {
          const r = await addPublication({
            document_id: editingPublication.id,
            title: payload.titulo,
            description: payload.resumen,
            autor: payload.autor,
            programa_id: payload.programa,
            linea_id: payload.lineaId,
            anio: payload.anio,
            lineaTematica: payload.lineaTematica,
            palabrasClave: payload.palabrasClave,
            workflow_status: editingPublication.workflow_status,
            file: selectedFile,
          });
          if (!r.success) throw new Error(r.error || "No se pudo reemplazar el archivo");
        } else {
          const r = await updatePublication(editingPublication.id, {
            title: payload.titulo,
            titulo: payload.titulo,
            autor: payload.autor,
            programa_id: payload.programa,
            linea_id: payload.lineaId,
            año: payload.anio,
            lineaTematica: payload.lineaTematica,
            description: payload.resumen,
            resumen: payload.resumen,
            palabrasClave: payload.palabrasClave,
          });
          if (!r.success) throw new Error(r.error || "No se pudo actualizar el documento");
        }

        if (submitMode === "review" && canSubmitForReview(user, editingPublication)) {
          const r = await applyWorkflowAction(editingPublication.id, "submit_for_review");
          if (!r.success) throw new Error(r.error || "No se pudo enviar a evaluación");
        }

        setSubmitStatus("success");
        setMessage(
          submitMode === "review"
            ? "Documento actualizado y enviado a evaluación."
            : "Documento actualizado correctamente.",
        );
      } else {
        if (!selectedFile) throw new Error("Debes seleccionar un archivo PDF");

        const r = await addPublication({
          title: payload.titulo,
          description: payload.resumen,
          autor: payload.autor,
          programa_id: payload.programa,
          linea_id: payload.lineaId,
          anio: payload.anio,
          lineaTematica: payload.lineaTematica,
          palabrasClave: payload.palabrasClave,
          workflow_status: "borrador",
          file: selectedFile,
        });
        if (!r.success) throw new Error(r.error || "No se pudo guardar el documento");

        if (submitMode === "review" && r.documentId) {
          const t = await applyWorkflowAction(r.documentId, "submit_for_review");
          if (!t.success) throw new Error(t.error || "No se pudo enviar a evaluación");
        }

        setSubmitStatus("success");
        setMessage(
          submitMode === "review"
            ? "Documento creado y enviado a evaluación."
            : "Documento guardado como borrador.",
        );
      }

      resetForm();
      await refreshPublications();
    } catch (error) {
      setSubmitStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo completar la operación");
    }

    setIsSubmitting(false);
  };

  const isFormValid =
    !!formData.titulo &&
    !!formData.autor &&
    !!formData.programa &&
    !!formData.lineaId &&
    !!formData.lineaTematica &&
    !!formData.resumen &&
    !!formData.palabrasClave &&
    (!!selectedFile || !!editingPublication);

  /* ── Render ── */
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {editingPublication ? "Editar recurso" : "Subir recurso digital"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {editingPublication
            ? "Modifica los campos necesarios y guarda o envía a evaluación."
            : "Completa la información del recurso y adjunta el PDF."}
        </p>
      </div>

      {/* Borradores pendientes — solo si existen */}
      {editablePublications.length > 0 && (
        <div className="mb-6 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setDraftsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Continuar editando un recurso existente
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {editablePublications.length}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                draftsOpen && "rotate-180",
              )}
            />
          </button>

          {draftsOpen && (
            <div className="border-t border-border px-4 pb-3 pt-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {editablePublications.map((pub) => (
                  <button
                    key={pub.id}
                    type="button"
                    onClick={() => {
                      setEditingPublication(pub);
                      setDraftsOpen(false);
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      editingPublication?.id === pub.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <p className="truncate font-medium text-foreground">{pub.titulo}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {pub.programa} · {pub.año} ·{" "}
                      <span className={cn(
                        pub.workflow_status === "ajustes_solicitados"
                          ? "text-orange-600"
                          : "text-stone-500",
                      )}>
                        {pub.workflow_status === "ajustes_solicitados" ? "Ajustes solicitados" : "Borrador"}
                      </span>
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alertas */}
      {submitStatus === "success" && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {message}
        </div>
      )}
      {submitStatus === "error" && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Título */}
        <div className="space-y-1.5">
          <Label htmlFor="titulo">Título <span className="text-destructive">*</span></Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Título completo del recurso digital"
            required
          />
        </div>

        {/* Autor */}
        <div className="space-y-1.5">
          <Label htmlFor="autor">Autor(es) <span className="text-destructive">*</span></Label>
          <Input
            id="autor"
            value={formData.autor}
            onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
            placeholder="Nombre del autor o autores separados por coma"
            required
          />
        </div>

        {/* Programa + Año */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="programa">Programa académico <span className="text-destructive">*</span></Label>
            <select
              id="programa"
              className={SELECT_CLASS}
              value={formData.programa}
              onChange={(e) => handleProgramChange(e.target.value)}
              required
            >
              <option value="">Selecciona…</option>
              {programOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="anio">Año <span className="text-destructive">*</span></Label>
            <select
              id="anio"
              className={SELECT_CLASS}
              value={formData.anio}
              onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
              required
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year.toString()}>{year}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Línea temática */}
        <div className="space-y-1.5">
          <Label htmlFor="lineaTematica">Línea temática <span className="text-destructive">*</span></Label>
          <select
            id="lineaTematica"
            className={SELECT_CLASS}
            value={formData.lineaId}
            onChange={(e) => handleThematicLineChange(e.target.value)}
            disabled={!formData.programa || thematicLineOptions.length === 0}
            required
          >
            <option value="">
              {formData.programa ? "Selecciona…" : "Selecciona primero un programa"}
            </option>
            {thematicLineOptions.map((linea) => (
              <option key={linea.id} value={linea.id}>{linea.nombre}</option>
            ))}
          </select>
        </div>

        {/* Resumen */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="resumen">Resumen <span className="text-destructive">*</span></Label>
            <span className={cn(
              "text-xs tabular-nums",
              formData.resumen.length > 450 ? "text-amber-600" : "text-muted-foreground",
            )}>
              {formData.resumen.length}/500
            </span>
          </div>
          <Textarea
            id="resumen"
            value={formData.resumen}
            onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
            placeholder="Describe el objetivo y aporte del recurso…"
            rows={4}
            maxLength={500}
            required
            className="resize-none"
          />
        </div>

        {/* Palabras clave */}
        <div className="space-y-1.5">
          <Label htmlFor="palabrasClave">Palabras clave <span className="text-destructive">*</span></Label>
          <Input
            id="palabrasClave"
            value={formData.palabrasClave}
            onChange={(e) => setFormData({ ...formData, palabrasClave: e.target.value })}
            placeholder="educación, tecnología, innovación…"
            required
          />
          <p className="text-xs text-muted-foreground">Separa cada término con una coma.</p>
        </div>

        {/* Dropzone PDF */}
        <div className="space-y-1.5">
          <Label>
            Archivo PDF{" "}
            {editingPublication
              ? <span className="text-muted-foreground font-normal">(opcional)</span>
              : <span className="text-destructive">*</span>}
          </Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "cursor-pointer rounded-xl border-2 border-dashed px-5 py-6 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : selectedFile
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-border hover:border-primary/40 hover:bg-muted/20",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · PDF
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Upload className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm">
                    {isDragging ? "Suelta el archivo aquí" : "Arrastra un PDF o haz clic para buscarlo"}
                  </p>
                  {editingPublication && (
                    <p className="text-xs">Si no adjuntas uno nuevo se conserva el PDF actual.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-border" />

        {/* Botones */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            variant="outline"
            className="flex-1"
            disabled={isSubmitting || !isFormValid}
            onClick={() => setSubmitMode("draft")}
          >
            {isSubmitting && submitMode === "draft" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar borrador
          </Button>
          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={isSubmitting || !isFormValid}
            onClick={() => setSubmitMode("review")}
          >
            {isSubmitting && submitMode === "review" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Enviar a evaluación
          </Button>
        </div>

        {/* Nota contextual discreta */}
        <p className="text-center text-xs text-muted-foreground">
          Una vez enviado no podrás editar el recurso hasta recibir retroalimentación del evaluador.
        </p>

        {/* Cancelar edición */}
        {editingPublication && (
          <div className="text-center">
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Cancelar edición
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
