"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import { PROGRAMAS_ACADEMICOS, LINEAS_TEMATICAS } from "@/lib/types";

export function UploadPage() {
  const { user, isLoading } = useAuth();
  const { addPublication } = usePublications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    programa: "",
    año: new Date().getFullYear().toString(),
    lineaTematica: "",
    resumen: "",
    palabrasClave: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
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
                Debes iniciar sesión para subir un recurso digital.
              </p>
              <Button asChild>
                <Link href="/auth">Iniciar sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert("Solo se permiten archivos PDF");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      addPublication({
        titulo: formData.titulo,
        autor: formData.autor,
        programa: formData.programa,
        año: parseInt(formData.año),
        lineaTematica: formData.lineaTematica,
        resumen: formData.resumen,
        palabrasClave: formData.palabrasClave
          .split(",")
          .map((kw) => kw.trim())
          .filter(Boolean),
        estado: "publicado",
      });

      setSubmitStatus("success");
      setFormData({
        titulo: "",
        autor: "",
        programa: "",
        año: new Date().getFullYear().toString(),
        lineaTematica: "",
        resumen: "",
        palabrasClave: "",
      });
      setSelectedFile(null);
    } catch {
      setSubmitStatus("error");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Subir REDS</h1>
        <p className="mt-2 text-muted-foreground">
          Completa el formulario para publicar tu recurso digital
        </p>
      </div>

      {submitStatus === "success" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <span>Recurso digital publicado correctamente.</span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Error al publicar el recurso digital. Intenta de nuevo.</span>
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
                placeholder="Ingresa el título de tu recurso digital"
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
              <Select
                value={formData.programa}
                onValueChange={(value) =>
                  setFormData({ ...formData, programa: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona programa" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMAS_ACADEMICOS.map((prog) => (
                    <SelectItem key={prog} value={prog}>
                      {prog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="año">Año *</Label>
              <Select
                value={formData.año}
                onValueChange={(value) =>
                  setFormData({ ...formData, año: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona año" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="lineaTematica">Línea temática *</Label>
              <Select
                value={formData.lineaTematica}
                onValueChange={(value) =>
                  setFormData({ ...formData, lineaTematica: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona línea temática" />
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

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="resumen">Resumen *</Label>
              <Textarea
                id="resumen"
                value={formData.resumen}
                onChange={(e) =>
                  setFormData({ ...formData, resumen: e.target.value })
                }
                placeholder="Escribe un resumen de tu recurso digital (máximo 500 caracteres)"
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
              <Label>Archivo PDF *</Label>
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
                      o arrastra y suelta aquí
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
                !selectedFile
              }
            >
              {isSubmitting ? "Publicando..." : "Publicar REDS"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
