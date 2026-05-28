"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  FileText,
  Loader2,
  Search,
  Settings2,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const ROLE_OPTIONS: UserRole[] = ["estudiante", "docente", "evaluador", "admin"];

/* ── Color semántico por rol ── */
const ROLE_BADGE: Record<UserRole | string, string> = {
  admin:      "bg-emerald-100 text-emerald-700 border-emerald-200",
  evaluador:  "bg-violet-100  text-violet-700  border-violet-200",
  docente:    "bg-amber-100   text-amber-700   border-amber-200",
  moderador:  "bg-sky-100     text-sky-700     border-sky-200",
  estudiante: "bg-stone-100   text-stone-600   border-stone-200",
};

/* Iniciales del avatar */
function getInitials(name?: string | null, username?: string | null): string {
  const source = name?.trim() || username?.trim() || "?";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/* Color de fondo del avatar basado en el nombre (determinista) */
function getAvatarColor(seed: string): string {
  const colors = [
    "bg-sky-200 text-sky-800",
    "bg-amber-200 text-amber-800",
    "bg-violet-200 text-violet-800",
    "bg-emerald-200 text-emerald-800",
    "bg-rose-200 text-rose-800",
    "bg-orange-200 text-orange-800",
    "bg-teal-200 text-teal-800",
    "bg-indigo-200 text-indigo-800",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminPage() {
  const { user, isLoading, updateUserRole } = useAuth();
  const { publications, isLoading: publicationsLoading } = usePublications();
  const supabase = useSupabase();
  const [profiles, setProfiles]           = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [savingRoleFor, setSavingRoleFor]  = useState<string | null>(null);
  const [errorMessage, setErrorMessage]   = useState("");
  const [search, setSearch]               = useState("");
  const [roleFilter, setRoleFilter]       = useState<UserRole | "todos">("todos");

  useEffect(() => {
    if (isLoading || !isAdmin(user)) return;
    if (!supabase) {
      setErrorMessage("Supabase no está disponible");
      setProfilesLoading(false);
      return;
    }

    const load = async () => {
      setProfilesLoading(true);
      const { data, error } = await supabase
        .from("cartagena_usuario_usuario")
        .select("id,email,username,full_name,role,telefono,created_at,updated_at")
        .order("created_at", { ascending: false });

      if (error) { setErrorMessage(error.message); setProfiles([]); }
      else        { setProfiles((data ?? []) as Profile[]); }
      setProfilesLoading(false);
    };

    void load();
  }, [isLoading, supabase, user]);

  const counts = useMemo(() => ({
    total:      profiles.length,
    docentes:   profiles.filter((p) => p.role === "docente").length,
    evaluadores: profiles.filter((p) => p.role === "evaluador" || p.role === "moderador").length,
    admins:     profiles.filter((p) => p.role === "admin").length,
    suspendidos: publications.filter((p) => p.workflow_status === "suspendida").length,
    publicadas:  publications.filter((p) => p.workflow_status === "publicada").length,
  }), [profiles, publications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles.filter((p) => {
      const matchRole = roleFilter === "todos" || p.role === roleFilter;
      const matchSearch = !q ||
        (p.username ?? "").toLowerCase().includes(q) ||
        (p.full_name ?? "").toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [profiles, search, roleFilter]);

  /* ── Acceso denegado ── */
  if (!isLoading && (!user || !isAdmin(user))) {
    return (
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.06),_transparent_40%)]" />
        <div className="relative mx-auto max-w-lg px-4 py-24 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Acceso denegado</h1>
          <p className="mt-3 text-muted-foreground">Solo los administradores pueden acceder a esta sección.</p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ── Cargando ── */
  if (isLoading || publicationsLoading || profilesLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    );
  }

  const handleRoleChange = async (profileId: string, nextRole: UserRole) => {
    if (!supabase) { setErrorMessage("Supabase no está disponible"); return; }
    setSavingRoleFor(profileId);
    setErrorMessage("");
    const result = await updateUserRole(profileId, nextRole);
    if (!result.success) { setErrorMessage(result.error || "No se pudo cambiar el rol"); setSavingRoleFor(null); return; }

    const { data, error } = await supabase
      .from("cartagena_usuario_usuario")
      .select("id,email,username,full_name,role,telefono,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (!error) setProfiles((data ?? []) as Profile[]);
    setSavingRoleFor(null);
  };

  const statCards = [
    { label: "Usuarios totales",  value: counts.total,      icon: Users,     bg: "bg-primary/10",    icon_color: "text-primary",      ring: "ring-primary/10" },
    { label: "Docentes",          value: counts.docentes,   icon: FileText,  bg: "bg-amber-100",     icon_color: "text-amber-600",    ring: "ring-amber-100" },
    { label: "Evaluadores",       value: counts.evaluadores,icon: Shield,    bg: "bg-violet-100",    icon_color: "text-violet-600",   ring: "ring-violet-100" },
    { label: "Administradores",   value: counts.admins,     icon: BadgeCheck,bg: "bg-emerald-100",   icon_color: "text-emerald-600",  ring: "ring-emerald-100" },
    { label: "Docs publicados",   value: counts.publicadas, icon: FileText,  bg: "bg-sky-100",       icon_color: "text-sky-600",      ring: "ring-sky-100" },
    { label: "Docs suspendidos",  value: counts.suspendidos,icon: AlertCircle,bg:"bg-red-100",       icon_color: "text-red-500",      ring: "ring-red-100" },
  ];

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_top_left,_rgba(99,102,241,0.06),_transparent),radial-gradient(ellipse_40%_30%_at_bottom_right,_rgba(245,158,11,0.05),_transparent)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ── Encabezado ── */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Settings2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Panel de control</p>
                <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">Administración</h1>
              </div>
            </div>
            <p className="ml-[52px] max-w-xl text-sm text-muted-foreground">
              Gestiona usuarios, roles y acceso institucional del repositorio REDS Colombia.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2">
            <Link href="/gestion-publicaciones">
              Gestionar REDS
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* ── Error global ── */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* ── Stats ── */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {statCards.map(({ label, value, icon: Icon, bg, icon_color, ring }) => (
            <div key={label} className={`rounded-2xl border border-border/50 bg-card p-4 shadow-sm ring-2 ${ring}`}>
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${icon_color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabla de usuarios ── */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">

          {/* Cabecera de la tabla */}
          <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-base font-semibold text-foreground">Usuarios registrados</h2>
                <p className="text-xs text-muted-foreground">{filtered.length} de {profiles.length} mostrados</p>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar usuario…"
                  className="h-9 w-52 pl-8 text-sm"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "todos")}>
                <SelectTrigger className="h-9 w-36 text-sm">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contenido */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">Sin resultados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search || roleFilter !== "todos" ? "Prueba con otros filtros." : "No hay usuarios registrados."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Usuario
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Correo
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Rol
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Registro
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Cambiar rol
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((profile) => {
                    const initials   = getInitials(profile.full_name, profile.username);
                    const avatarColor = getAvatarColor(profile.id ?? profile.username ?? "?");
                    const isSaving   = savingRoleFor === profile.id;

                    return (
                      <tr
                        key={profile.id}
                        className="group transition-colors hover:bg-muted/30"
                      >
                        {/* Usuario */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor}`}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {profile.full_name || "Sin nombre"}
                              </p>
                              <p className="text-xs text-muted-foreground">@{profile.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Correo */}
                        <td className="px-5 py-3.5">
                          <p className="truncate max-w-[200px] text-sm text-muted-foreground">
                            {profile.email}
                          </p>
                        </td>

                        {/* Rol actual */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[profile.role] ?? ROLE_BADGE.estudiante}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {ROLE_LABELS[profile.role as UserRole] ?? profile.role}
                          </span>
                        </td>

                        {/* Fecha de registro */}
                        <td className="px-5 py-3.5">
                          <p className="text-xs text-muted-foreground">{formatDate(profile.created_at)}</p>
                        </td>

                        {/* Selector de rol */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Select
                              value={profile.role}
                              onValueChange={(v) => void handleRoleChange(profile.id, v as UserRole)}
                              disabled={isSaving}
                            >
                              <SelectTrigger className="h-8 w-36 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((r) => (
                                  <SelectItem key={r} value={r} className="text-xs">
                                    {ROLE_LABELS[r]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pie de tabla */}
          {filtered.length > 0 && (
            <div className="border-t border-border/50 px-5 py-3 text-xs text-muted-foreground">
              {filtered.length} usuario{filtered.length !== 1 ? "s" : ""} mostrado{filtered.length !== 1 ? "s" : ""}
              {roleFilter !== "todos" && ` · Filtrando por: ${ROLE_LABELS[roleFilter as UserRole]}`}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
