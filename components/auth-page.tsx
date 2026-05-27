"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Shield,
  Upload,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

function normalizeRedirectPath(nextPath: string | null) {
  if (!nextPath) return "/";
  const trimmed = nextPath.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  if (trimmed.startsWith("/auth")) return "/";
  return trimmed;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Muy débil", color: "bg-red-500" };
  if (score === 2) return { score, label: "Débil", color: "bg-orange-500" };
  if (score === 3) return { score, label: "Aceptable", color: "bg-amber-400" };
  if (score === 4) return { score, label: "Fuerte", color: "bg-lime-500" };
  return { score, label: "Muy fuerte", color: "bg-green-500" };
}

const FEATURES = [
  {
    icon: Upload,
    title: "Publica tus recursos",
    desc: "Sube documentos y materiales académicos al repositorio institucional.",
  },
  {
    icon: FileText,
    title: "Acceso al catálogo",
    desc: "Explora cientos de publicaciones validadas por el comité académico.",
  },
  {
    icon: Shield,
    title: "Flujo editorial",
    desc: "Sigue el proceso de revisión de cada publicación en tiempo real.",
  },
  {
    icon: Users,
    title: "Comunidad académica",
    desc: "Conecta con investigadores y docentes de REDS Colombia.",
  },
];

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeNextPath = normalizeRedirectPath(searchParams.get("next"));
  const { user, isLoading, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nombre: "",
    email: "",
    usuario: "",
    password: "",
    confirmPassword: "",
  });

  const passwordStrength = getPasswordStrength(registerForm.password);

  useEffect(() => {
    if (user) router.replace(safeNextPath);
  }, [router, safeNextPath, user]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    const result = await login(loginForm.identifier, loginForm.password);
    if (result.success) {
      setSuccess("Sesion iniciada correctamente.");
      setIsSubmitting(false);
      return;
    }
    setError(result.error || "No se pudo iniciar sesion.");
    setIsSubmitting(false);
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Las contrasenas no coinciden.");
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
      return;
    }
    setError(result.error || "No se pudo crear la cuenta.");
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    const result = await loginWithGoogle(safeNextPath);
    if (!result.success) {
      setError(result.error || "No se pudo iniciar sesion con Google.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#0f0a06_0%,_#1a1008_45%,_#0f0a06_100%)] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-stone-300 shadow-2xl backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,_#0c0804_0%,_#1a1008_55%,_#0e0905_100%)] text-stone-100">

      {/* ── Fondo decorativo ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-amber-700/15 blur-[140px]" />
        <div className="absolute -bottom-32 right-0 h-[450px] w-[450px] rounded-full bg-orange-900/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[250px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-950/20 blur-[90px]" />
      </div>
      {/* Cuadrícula sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl px-4 py-12 sm:px-6 lg:grid-cols-[1fr_460px] lg:items-center lg:gap-16 lg:px-8 lg:py-0">

        {/* ════════════════════════════════════════
            COLUMNA IZQUIERDA — Branding + features
        ════════════════════════════════════════ */}
        <section className="flex flex-col gap-10 lg:py-20">

          {/* Logo / volver */}
          <Link
            href="/"
            className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-stone-300 backdrop-blur-sm transition hover:border-amber-400/30 hover:bg-white/10 hover:text-white"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400 transition-transform group-hover:-rotate-6" />
            Repositorio REDS Colombia
          </Link>

          {/* Headline */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-300">
                Acceso al repositorio
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              El repositorio{" "}
              <span className="bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                académico
              </span>{" "}
              de REDS Colombia.
            </h1>

            <p className="max-w-md text-base leading-relaxed text-stone-400">
              Publica, descubre y gestiona recursos digitales validados por
              un comité editorial con estándares académicos internacionales.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.04] p-4 backdrop-blur-sm"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-stone-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pie */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-xs text-stone-600">REDS Colombia · 2026</span>
          </div>
        </section>

        {/* ════════════════════════════════════════
            COLUMNA DERECHA — Formulario
        ════════════════════════════════════════ */}
        <div className="flex items-center justify-center lg:py-12">
          <div className="w-full rounded-3xl border border-white/8 bg-white/[0.05] p-6 shadow-2xl shadow-black/60 backdrop-blur-2xl sm:p-8">

            {/* Cabecera del card */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 ring-1 ring-amber-400/20">
                  {mode === "login"
                    ? <User className="h-4 w-4 text-amber-400" />
                    : <UserPlus className="h-4 w-4 text-amber-400" />}
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
                  {mode === "login" ? "Bienvenido de nuevo" : "Únete ahora"}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {mode === "login" ? "Inicia sesión" : "Crea tu cuenta gratis"}
              </h2>
              <p className="mt-1 text-sm text-stone-400">
                {mode === "login"
                  ? "Usa tu correo y contraseña para entrar."
                  : "Completa el formulario y empieza a explorar."}
              </p>
            </div>

            {/* Selector de modo */}
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/8 bg-white/5 p-1">
              {(["login", "register"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    mode === m
                      ? "bg-gradient-to-b from-white/12 to-white/6 text-white shadow-sm ring-1 ring-white/10"
                      : "text-stone-400 hover:text-stone-200",
                  )}
                >
                  {m === "login" ? "Iniciar sesión" : "Registro"}
                </button>
              ))}
            </div>

            {/* Alerta error */}
            {error ? (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 p-3.5 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            {/* Alerta éxito */}
            {success ? (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3.5 text-sm text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            ) : null}

            {/* Botón Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path d="M21.35 11.1h-9.18v2.94h5.26c-.23 1.27-.96 2.35-2.05 3.07v2.55h3.32c1.94-1.79 3.05-4.43 3.05-7.56 0-.75-.07-1.48-.2-2z" fill="#4285F4" />
                <path d="M12.17 22c2.76 0 5.07-.91 6.76-2.48l-3.32-2.55c-.92.62-2.1.98-3.44.98-2.64 0-4.88-1.78-5.68-4.18H3.07v2.62A9.98 9.98 0 0 0 12.17 22z" fill="#34A853" />
                <path d="M6.49 13.77c-.2-.62-.32-1.27-.32-1.97s.12-1.35.32-1.97V7.21H3.07A9.98 9.98 0 0 0 2.2 11.8c0 1.63.39 3.17 1.08 4.53l3.21-2.56z" fill="#FBBC05" />
                <path d="M12.17 5.03c1.5 0 2.84.52 3.9 1.55l2.92-2.92A9.86 9.86 0 0 0 12.17 2a9.98 9.98 0 0 0-9.1 5.21l3.42 2.59c.8-2.4 3.04-4.77 5.68-4.77z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>

            {/* Separador */}
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-xs text-stone-600">o con tu correo</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* ── FORMULARIO LOGIN ── */}
            {mode === "login" ? (
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                  <Label htmlFor="login-identifier" className="text-xs font-medium text-stone-400">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
                    <Input
                      id="login-identifier"
                      type="text"
                      autoComplete="username"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm((f) => ({ ...f, identifier: e.target.value }))}
                      placeholder="tu@correo.com"
                      required
                      className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs font-medium text-stone-400">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Tu contraseña"
                      required
                      className="h-11 border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 transition hover:text-stone-400"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-1 h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-stone-950 shadow-lg shadow-amber-900/30 hover:from-amber-400 hover:to-orange-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Ingresando..." : "Entrar"}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            ) : (
              /* ── FORMULARIO REGISTRO ── */
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="register-name" className="text-xs font-medium text-stone-400">
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
                      <Input
                        id="register-name"
                        type="text"
                        autoComplete="name"
                        value={registerForm.nombre}
                        onChange={(e) => setRegisterForm((f) => ({ ...f, nombre: e.target.value }))}
                        placeholder="Tu nombre"
                        required
                        className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-usuario" className="text-xs font-medium text-stone-400">
                      Usuario
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-600">@</span>
                      <Input
                        id="register-usuario"
                        type="text"
                        autoComplete="username"
                        value={registerForm.usuario}
                        onChange={(e) => setRegisterForm((f) => ({ ...f, usuario: e.target.value }))}
                        placeholder="tu_usuario"
                        required
                        className="h-11 border-white/10 bg-white/5 pl-8 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-email" className="text-xs font-medium text-stone-400">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="tu@correo.com"
                      required
                      className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-password" className="text-xs font-medium text-stone-400">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="h-11 border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 transition hover:text-stone-400"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Barra de fortaleza */}
                  {registerForm.password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all duration-300",
                              i <= passwordStrength.score
                                ? passwordStrength.color
                                : "bg-white/10",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-stone-500">
                        Fortaleza:{" "}
                        <span
                          className={cn("font-medium", {
                            "text-red-400": passwordStrength.score <= 1,
                            "text-orange-400": passwordStrength.score === 2,
                            "text-amber-400": passwordStrength.score === 3,
                            "text-lime-400": passwordStrength.score === 4,
                            "text-green-400": passwordStrength.score === 5,
                          })}
                        >
                          {passwordStrength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-confirm-password" className="text-xs font-medium text-stone-400">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="Repite la contraseña"
                      required
                      className={cn(
                        "h-11 border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-stone-600 focus:ring-amber-400/20",
                        registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword
                          ? "border-red-500/40 focus:border-red-500/60"
                          : registerForm.confirmPassword && registerForm.password === registerForm.confirmPassword
                            ? "border-green-500/40 focus:border-green-500/60"
                            : "focus:border-amber-400/50",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 transition hover:text-stone-400"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                    <p className="text-xs text-red-400">Las contraseñas no coinciden.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="mt-1 h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-stone-950 shadow-lg shadow-amber-900/30 hover:from-amber-400 hover:to-orange-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </Button>

                <p className="flex items-center gap-1.5 text-xs text-stone-600">
                  <Shield className="h-3 w-3 shrink-0 text-stone-700" />
                  Todas las cuentas nuevas se crean como estudiante de forma predeterminada.
                </p>
              </form>
            )}

            {/* Pie del card */}
            <div className="mt-6 border-t border-white/6 pt-5 text-center text-xs text-stone-500">
              {mode === "register" ? (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    Inicia sesión
                  </button>
                </>
              ) : (
                <>
                  ¿Eres nuevo aquí?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    Crea tu cuenta
                  </button>
                </>
              )}
              <span className="mx-2 text-stone-700">·</span>
              <Link href="/" className="font-medium text-stone-500 hover:text-stone-300 hover:underline">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
