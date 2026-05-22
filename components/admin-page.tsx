"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Shield,
  FileText,
  Users,
  BadgeCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import { useSupabase } from "@/lib/supabase/provider";
import type { Profile, UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";
import { isAdmin } from "@/lib/permissions";

const ROLE_OPTIONS: UserRole[] = ["estudiante", "moderador", "admin"];

export function AdminPage() {
  const { user, isLoading, updateUserRole } = useAuth();
  const { publications, isLoading: publicationsLoading } = usePublications();
  const supabase = useSupabase();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [savingRoleFor, setSavingRoleFor] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isLoading || !isAdmin(user)) {
      return;
    }

    const loadProfiles = async () => {
      setProfilesLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,username,full_name,role,programa,telefono,created_at,updated_at")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setProfiles([]);
      } else {
        setProfiles((data ?? []) as Profile[]);
      }

      setProfilesLoading(false);
    };

    void loadProfiles();
  }, [isLoading, supabase, user]);

  const counts = useMemo(() => {
    const moderatorCount = profiles.filter((profile) => profile.role === "moderador").length;
    const adminCount = profiles.filter((profile) => profile.role === "admin").length;
    const suspendedDocs = publications.filter((publication) => publication.status === "suspendido").length;

    return {
      moderatorCount,
      adminCount,
      suspendedDocs,
    };
  }, [profiles, publications]);

  if (!user || !isAdmin(user)) {
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

  if (isLoading || publicationsLoading || profilesLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const handleRoleChange = async (profileId: string, nextRole: UserRole) => {
    setSavingRoleFor(profileId);
    setErrorMessage("");

    const result = await updateUserRole(profileId, nextRole);

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo cambiar el rol");
      setSavingRoleFor(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,username,full_name,role,programa,telefono,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (!error) {
      setProfiles((data ?? []) as Profile[]);
    }

    setSavingRoleFor(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <Shield className="h-8 w-8 text-primary" />
            Panel de administración
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona usuarios, roles y acceso administrativo del repositorio.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/moderacion">
              Ir a moderación
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/subir">Administrar documentos</Link>
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
              <p className="text-sm text-muted-foreground">Usuarios</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <BadgeCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.adminCount}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.suspendedDocs}</p>
              <p className="text-sm text-muted-foreground">Docs suspendidos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.moderatorCount}</p>
              <p className="text-sm text-muted-foreground">Moderadores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Usuarios registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No hay usuarios para mostrar
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Nombre
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
                  {profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {profile.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {profile.full_name || "Sin nombre"}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={profile.role}
                          onValueChange={(value) => handleRoleChange(profile.id, value as UserRole)}
                          disabled={savingRoleFor === profile.id}
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {profile.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
