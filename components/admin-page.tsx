"use client";

import { useState } from "react";
import {
  Shield,
  FileText,
  Users,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function AdminPage() {
  const { user, isLoading } = useAuth();
  const {
    publications,
    updatePublication,
    deletePublication,
    isLoading: publicationsLoading,
  } = usePublications();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading || publicationsLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Acceso denegado
            </h2>
            <p className="text-muted-foreground">
              Solo los administradores pueden acceder a esta sección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publishedCount = publications.filter(
    (p) => p.estado === "publicado"
  ).length;
  const reviewCount = publications.filter(
    (p) => p.estado === "en_revision"
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Shield className="h-8 w-8 text-primary" />
          Panel de administración
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona los recursos digitales y usuarios del repositorio
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {publications.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Total recursos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {publishedCount}
              </p>
              <p className="text-sm text-muted-foreground">Publicados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{reviewCount}</p>
              <p className="text-sm text-muted-foreground">En revisión</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users card */}
      <Card className="mb-8 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Usuarios registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Correo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-sm">admin</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-primary/10 text-primary">
                      Administrador
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    admin@redscolombia.co
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">prueba</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">Estudiante</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    prueba@redscolombia.co
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Publications management */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gestion de recursos digitales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {publications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No hay recursos digitales registrados
            </div>
          ) : (
            <div className="space-y-4">
              {publications.map((pub) => (
                <div
                  key={pub.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground line-clamp-1">
                      {pub.titulo}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {pub.autor} • {pub.programa} • {pub.año}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={pub.estado}
                      onValueChange={(value: "publicado" | "en_revision") =>
                        updatePublication(pub.id, { estado: value })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publicado">Publicado</SelectItem>
                        <SelectItem value="en_revision">En revisión</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setDeleteId(pub.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar recurso digital?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El recurso digital sera eliminado
              permanentemente del repositorio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deletePublication(deleteId);
                  setDeleteId(null);
                }
              }}
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
