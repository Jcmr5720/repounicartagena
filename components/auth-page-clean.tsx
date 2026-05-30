"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  User,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

type AuthMode = "login" | "register";

const ROLES = [
  {
    key: "estudiante",
    title: "Estudiante",
    subtitle: "Consulta y aprende",
    description:
      "Explora recursos educativos validados y guarda tus publicaciones favoritas.",
    permissions: [
      "Explorar y buscar recursos por área",
      "Guardar publicaciones favoritas",
      "Descargar materiales aprobados",
    ],
    icon: User,
    iconClass: "bg-sky-50 text-sky-600",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
    cardHover: "hover:border-sky-400",
  },
  {
    key: "docente",
    title: "Docente",
    subtitle: "Carga recursos académicos",
    description:
      "Sube publicaciones, organiza la información y envíala a evaluación.",
    permissions: [
      "Subir y organizar recursos REDS",
      "Gestionar tus publicaciones propias",
      "Enviar recursos a evaluación",
    ],
    icon: GraduationCap,
    iconClass: "bg-amber-50 text-amber-600",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    cardHover: "hover:border-amber-400",
  },
  {
    key: "evaluador",
    title: "Evaluador",
    subtitle: "Evalúa con criterio",
    description:
      "Revisa recursos mediante rúbrica, emite concepto y registra decisiones académicas.",
    permissions: [
      "Revisar recursos asignados",
      "Aplicar rúbricas de evaluación",
      "Emitir concepto y decisión académica",
    ],
    icon: Shield,
    iconClass: "bg-violet-50 text-violet-600",
    badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
    cardHover: "hover:border-violet-400",
  },
  {
    key: "administrador",
    title: "Administrador",
    subtitle: "Gestiona el repositorio",
    description:
      "Administra usuarios, roles, publicaciones y configuración general del sistema.",
    permissions: [
      "Gestionar usuarios y roles",
      "Supervisar publicaciones y evaluaciones",
      "Configurar el sistema general",
    ],
    icon: BadgeCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cardHover: "hover:border-emerald-400",
  },
];

type Role = (typeof ROLES)[number];

const GRID_BG =
  "absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px]";

/* ─────────────────────────────────────────────────────────────
   STEP 1: Role selection
───────────────────────────────────────────────────────────── */
function RoleSelectionStep({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={`pointer-events-none ${GRID_BG}`} />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-4xl">

          {/* Top bar */}
          <div className="mb-10 flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
            >
              <BookOpen className="h-4 w-4 transition-transform group-hover:-rotate-6" />
              Repositorio REDS Colombia
            </Link>
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Volver al inicio
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Acceso institucional
              </span>
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              ¿Con qué perfil vas a ingresar?
            </h1>
            <p className="text-base text-muted-foreground">
              Selecciona tu rol para continuar al acceso institucional de REDS Colombia.
            </p>
          </div>

          {/* Role cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => onSelect(role)}
                  className={`group flex flex-col gap-5 rounded-xl border-2 border-border bg-card p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${role.cardHover}`}
                >
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${role.iconClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${role.badgeClass}`}>
                      {role.subtitle}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="space-y-1.5">
                    <p className="text-lg font-bold text-foreground">{role.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {role.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                      Seleccionar perfil
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Repositorio REDS Colombia · 2026
            <span className="mx-1.5 opacity-40">·</span>
            <Link href="/" className="hover:text-foreground hover:underline">
              Política de privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────── */
export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const { user, isLoading, login, register, loginWithGoogle } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nombre: "",
    email: "",
    usuario: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) router.replace(nextPath);
  }, [nextPath, router, user]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setSuccess(""); setIsSubmitting(true);
    const result = await login(loginForm.identifier, loginForm.password);
    if (result.success) {
      setSuccess("Sesión iniciada correctamente.");
      setIsSubmitting(false);
      router.replace(nextPath);
      return;
    }
    setError(result.error || "No se pudo iniciar sesión.");
    setIsSubmitting(false);
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsSubmitting(true);
    const result = await register({
      nombre: registerForm.nombre,
      email: registerForm.email,
      usuario: registerForm.usuario,
      password: registerForm.password,
    });
    if (result.success) {
      setSuccess(
        result.needsVerification
          ? "Cuenta creada. Revisa tu correo para confirmar el acceso."
          : "Cuenta creada correctamente.",
      );
      setIsSubmitting(false);
      if (!result.needsVerification) router.replace(nextPath);
      return;
    }
    setError(result.error || "No se pudo crear la cuenta.");
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError(""); setSuccess(""); setIsSubmitting(true);
    const result = await loginWithGoogle(nextPath);
    if (!result.success) {
      setError(result.error || "No se pudo iniciar sesión con Google.");
      setIsSubmitting(false);
    }
  };

  const handleBack = () => { setSelectedRole(null); setError(""); setSuccess(""); };
  const switchMode = (m: AuthMode) => { setMode(m); setError(""); setSuccess(""); };

  /* Loading */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2.5 rounded-xl border bg-card px-5 py-3 text-sm shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    );
  }

  /* Step 1 */
  if (!selectedRole) return <RoleSelectionStep onSelect={setSelectedRole} />;

  /* Step 2 */
  const RoleIcon = selectedRole.icon;
  const pluralTitle =
    selectedRole.key === "administrador"
      ? "administradores"
      : `${selectedRole.title.toLowerCase()}s`;

  return (
    <div className="relative min-h-screen bg-background">
      <div className={`pointer-events-none ${GRID_BG}`} />

      <div className="relative flex min-h-screen flex-col lg:flex-row">

        {/* ── Left panel: institutional info ── */}
        <div className="flex flex-col px-6 py-10 sm:px-10 lg:max-w-[520px] lg:justify-center lg:px-14 lg:py-20">

          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            className="group mb-10 inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-border hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Cambiar perfil
          </button>

          {/* Role badge */}
          <div className={`mb-5 inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold ${selectedRole.badgeClass}`}>
            <RoleIcon className="h-4 w-4" />
            {selectedRole.title}
          </div>

          {/* Heading */}
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Acceso para <span className="text-primary">{pluralTitle}</span>
          </h1>

          <p className="mb-8 max-w-sm text-base leading-relaxed text-muted-foreground">
            {selectedRole.description}
          </p>

          {/* Permissions — desktop only */}
          <div className="hidden lg:block">
            <div className="mb-6 h-px bg-border" />
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Con este perfil puedes
            </p>
            <ul className="space-y-3">
              {selectedRole.permissions.map((perm) => (
                <li key={perm} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  {perm}
                </li>
              ))}
            </ul>

            {/* Brand block */}
            <div className="mt-10 flex items-center gap-3 rounded-xl border bg-muted/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">REDS Colombia</p>
                <p className="text-xs text-muted-foreground">Repositorio educativo institucional</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <div className="flex flex-1 items-start justify-center bg-muted/30 px-4 py-10 sm:px-8 lg:items-center lg:py-20">
          <Card className="w-full max-w-[440px] border shadow-md">
            <CardContent className="p-7">

              {/* Card header */}
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    {mode === "login"
                      ? <User className="h-4 w-4 text-primary" />
                      : <UserPlus className="h-4 w-4 text-primary" />
                    }
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {mode === "login" ? "Bienvenido de nuevo" : "Nuevo en la plataforma"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Accede con tu correo y contraseña."
                    : "Completa el formulario para registrarte."}
                </p>
              </div>

              {/* Mode tabs */}
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border bg-muted/60 p-1">
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`rounded-md py-2.5 text-sm font-medium transition-all duration-150 ${
                      mode === m
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "login" ? "Iniciar sesión" : "Registro"}
                  </button>
                ))}
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-sm text-primary">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              {/* Google */}
              <Button
                type="button"
                variant="outline"
                className="mb-5 h-11 w-full gap-2.5 text-sm font-medium"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
                  <path d="M21.35 11.1h-9.18v2.94h5.26c-.23 1.27-.96 2.35-2.05 3.07v2.55h3.32c1.94-1.79 3.05-4.43 3.05-7.56 0-.75-.07-1.48-.2-2z" fill="#4285F4" />
                  <path d="M12.17 22c2.76 0 5.07-.91 6.76-2.48l-3.32-2.55c-.92.62-2.1.98-3.44.98-2.64 0-4.88-1.78-5.68-4.18H3.07v2.62A9.98 9.98 0 0 0 12.17 22z" fill="#34A853" />
                  <path d="M6.49 13.77c-.2-.62-.32-1.27-.32-1.97s.12-1.35.32-1.97V7.21H3.07A9.98 9.98 0 0 0 2.2 11.8c0 1.63.39 3.17 1.08 4.53l3.21-2.56z" fill="#FBBC05" />
                  <path d="M12.17 5.03c1.5 0 2.84.52 3.9 1.55l2.92-2.92A9.86 9.86 0 0 0 12.17 2a9.98 9.98 0 0 0-9.1 5.21l3.42 2.59c.8-2.4 3.04-4.77 5.68-4.77z" fill="#EA4335" />
                </svg>
                Continuar con Google
              </Button>

              {/* Divider */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">o con tu correo</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* ── Login form ── */}
              {mode === "login" ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-id" className="text-xs font-semibold text-foreground">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-id"
                        type="text"
                        autoComplete="username"
                        value={loginForm.identifier}
                        onChange={(e) => setLoginForm((s) => ({ ...s, identifier: e.target.value }))}
                        placeholder="tu@correo.com"
                        required
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-pw" className="text-xs font-semibold text-foreground">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-pw"
                        type="password"
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((s) => ({ ...s, password: e.target.value }))}
                        placeholder="Tu contraseña"
                        required
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="mt-1 h-11 w-full gap-2 font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? "Ingresando..." : <><span>Entrar</span><ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
              ) : (
                /* ── Register form ── */
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-nombre" className="text-xs font-semibold text-foreground">
                        Nombre completo
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-nombre"
                          type="text"
                          autoComplete="name"
                          value={registerForm.nombre}
                          onChange={(e) => setRegisterForm((s) => ({ ...s, nombre: e.target.value }))}
                          placeholder="Tu nombre"
                          required
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="reg-usuario" className="text-xs font-semibold text-foreground">
                        Usuario
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm leading-none text-muted-foreground">@</span>
                        <Input
                          id="reg-usuario"
                          type="text"
                          autoComplete="username"
                          value={registerForm.usuario}
                          onChange={(e) => setRegisterForm((s) => ({ ...s, usuario: e.target.value }))}
                          placeholder="tu_usuario"
                          required
                          className="h-11 pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-xs font-semibold text-foreground">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm((s) => ({ ...s, email: e.target.value }))}
                        placeholder="tu@correo.com"
                        required
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-pw" className="text-xs font-semibold text-foreground">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-pw"
                          type="password"
                          autoComplete="new-password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm((s) => ({ ...s, password: e.target.value }))}
                          placeholder="Crea una contraseña"
                          required
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="reg-pw2" className="text-xs font-semibold text-foreground">
                        Confirmar contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-pw2"
                          type="password"
                          autoComplete="new-password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                          placeholder="Repite la contraseña"
                          required
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="mt-1 h-11 w-full gap-2 font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? "Creando cuenta..." : <><span>Crear cuenta</span><ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
              )}

              {/* Card footer */}
              <p className="mt-5 text-center text-xs text-muted-foreground">
                {mode === "register" ? (
                  <>
                    ¿Ya tienes cuenta?{" "}
                    <button type="button" onClick={() => switchMode("login")} className="font-semibold text-primary hover:underline">
                      Inicia sesión
                    </button>
                  </>
                ) : (
                  <>
                    ¿Eres nuevo?{" "}
                    <button type="button" onClick={() => switchMode("register")} className="font-semibold text-primary hover:underline">
                      Crea tu cuenta
                    </button>
                  </>
                )}
                <span className="mx-1.5 opacity-30">·</span>
                <Link href="/" className="text-muted-foreground hover:text-foreground hover:underline">
                  Inicio
                </Link>
              </p>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
