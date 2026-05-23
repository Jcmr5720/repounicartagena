"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  Mail,
  User,
  UserPlus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

type AuthMode = "login" | "register";

function normalizeRedirectPath(nextPath: string | null) {
  if (!nextPath) {
    return "/";
  }

  const trimmed = nextPath.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }

  if (trimmed.startsWith("/auth")) {
    return "/";
  }

  return trimmed;
}

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeNextPath = normalizeRedirectPath(searchParams.get("next"));
  const { user, isLoading, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    nombre: "",
    email: "",
    usuario: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      router.replace(safeNextPath);
    }
  }, [router, safeNextPath, user]);

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
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#0f0a06_0%,_#1a1008_45%,_#0f0a06_100%)] px-4 text-stone-100">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm shadow-2xl backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,_#0f0a06_0%,_#1c1108_50%,_#100b06_100%)] text-stone-100">
      {/* Orbes de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-amber-700/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full bg-orange-800/15 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-amber-900/10 blur-[80px]" />
      </div>

      {/* Cuadrícula sutil de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_480px] lg:px-8 lg:py-0">

        {/* — Columna izquierda — */}
        <section className="flex flex-col justify-center space-y-8 lg:py-24">
          <Link
            href="/"
            className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-stone-300 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400 transition-transform group-hover:-rotate-6" />
            Repositorio REDS Colombia
          </Link>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-300">
                Acceso al repositorio
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Un lugar para{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                compartir
              </span>{" "}
              y explorar recursos.
            </h1>

            <p className="max-w-md text-base leading-relaxed text-stone-400">
              Crea tu cuenta y empieza a publicar, descubrir y administrar
              recursos digitales con REDS Colombia.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FeaturePill
              icon={<Zap className="h-4 w-4 text-amber-400" />}
              title="Registro rapido"
              description="Solo unos datos para empezar."
            />
            <FeaturePill
              icon={<User className="h-4 w-4 text-amber-400" />}
              title="Entra con Google"
              description="Un clic y listo."
            />
            <FeaturePill
              icon={<Lock className="h-4 w-4 text-amber-400" />}
              title="Perfil seguro"
              description="Tu informacion, protegida."
            />
          </div>

          {/* Línea decorativa */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-xs text-stone-600">REDS Colombia · 2025</span>
          </div>
        </section>

        {/* — Card de formulario — */}
        <div className="flex items-center justify-center lg:py-12">
          <Card className="w-full border-white/8 bg-white/[0.06] shadow-2xl shadow-black/50 backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8">

              {/* Cabecera */}
              <div className="mb-6 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15">
                    {mode === "login"
                      ? <User className="h-4 w-4 text-amber-400" />
                      : <UserPlus className="h-4 w-4 text-amber-400" />
                    }
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                    {mode === "login" ? "Bienvenido de nuevo" : "Unete ahora"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === "login" ? "Inicia sesion" : "Crea tu cuenta gratis"}
                </h2>
                <p className="text-sm text-stone-400">
                  {mode === "login"
                    ? "Usa tu correo y contrasena para entrar."
                    : "Completa el formulario y empieza a explorar."}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/8 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    mode === "login"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Iniciar sesion
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    mode === "register"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Registro
                </button>
              </div>

              {/* Alertas */}
              {error ? (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              {success ? (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              ) : null}

              {/* Botón Google */}
              <Button
                type="button"
                variant="outline"
                className="mb-5 h-11 w-full border-white/10 bg-white/5 text-stone-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path d="M21.35 11.1h-9.18v2.94h5.26c-.23 1.27-.96 2.35-2.05 3.07v2.55h3.32c1.94-1.79 3.05-4.43 3.05-7.56 0-.75-.07-1.48-.2-2z" fill="#4285F4" />
                  <path d="M12.17 22c2.76 0 5.07-.91 6.76-2.48l-3.32-2.55c-.92.62-2.1.98-3.44.98-2.64 0-4.88-1.78-5.68-4.18H3.07v2.62A9.98 9.98 0 0 0 12.17 22z" fill="#34A853" />
                  <path d="M6.49 13.77c-.2-.62-.32-1.27-.32-1.97s.12-1.35.32-1.97V7.21H3.07A9.98 9.98 0 0 0 2.2 11.8c0 1.63.39 3.17 1.08 4.53l3.21-2.56z" fill="#FBBC05" />
                  <path d="M12.17 5.03c1.5 0 2.84.52 3.9 1.55l2.92-2.92A9.86 9.86 0 0 0 12.17 2a9.98 9.98 0 0 0-9.1 5.21l3.42 2.59c.8-2.4 3.04-4.77 5.68-4.77z" fill="#EA4335" />
                </svg>
                Continua con Google
              </Button>

              {/* Separador */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-stone-500">o con tu correo</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Formulario login */}
              {mode === "login" ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-identifier" className="text-xs font-medium text-stone-300">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                      <Input
                        id="login-identifier"
                        type="text"
                        autoComplete="username"
                        value={loginForm.identifier}
                        onChange={(event) =>
                          setLoginForm((current) => ({ ...current, identifier: event.target.value }))
                        }
                        placeholder="tu@correo.com"
                        required
                        className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-xs font-medium text-stone-300">
                      Contrasena
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={(event) =>
                          setLoginForm((current) => ({ ...current, password: event.target.value }))
                        }
                        placeholder="Tu contrasena"
                        required
                        className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 h-11 w-full bg-amber-500 font-semibold text-stone-950 hover:bg-amber-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Ingresando..." : "Entrar"}
                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </form>
              ) : (
                /* Formulario registro */
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="register-name" className="text-xs font-medium text-stone-300">
                        Nombre completo
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                        <Input
                          id="register-name"
                          type="text"
                          autoComplete="name"
                          value={registerForm.nombre}
                          onChange={(event) =>
                            setRegisterForm((current) => ({ ...current, nombre: event.target.value }))
                          }
                          placeholder="Tu nombre"
                          required
                          className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="register-usuario" className="text-xs font-medium text-stone-300">
                        Usuario
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-500">@</span>
                        <Input
                          id="register-usuario"
                          type="text"
                          autoComplete="username"
                          value={registerForm.usuario}
                          onChange={(event) =>
                            setRegisterForm((current) => ({ ...current, usuario: event.target.value }))
                          }
                          placeholder="tu_usuario"
                          required
                          className="h-11 border-white/10 bg-white/5 pl-8 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-email" className="text-xs font-medium text-stone-300">
                      Correo electronico
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                      <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        value={registerForm.email}
                        onChange={(event) =>
                          setRegisterForm((current) => ({ ...current, email: event.target.value }))
                        }
                        placeholder="tu@correo.com"
                        required
                        className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="register-password" className="text-xs font-medium text-stone-300">
                        Contrasena
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                        <Input
                          id="register-password"
                          type="password"
                          autoComplete="new-password"
                          value={registerForm.password}
                          onChange={(event) =>
                            setRegisterForm((current) => ({ ...current, password: event.target.value }))
                          }
                          placeholder="Crea una contrasena"
                          required
                          className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="register-confirm-password" className="text-xs font-medium text-stone-300">
                        Confirmar contrasena
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                        <Input
                          id="register-confirm-password"
                          type="password"
                          autoComplete="new-password"
                          value={registerForm.confirmPassword}
                          onChange={(event) =>
                            setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))
                          }
                          placeholder="Repite la contrasena"
                          required
                          className="h-11 border-white/10 bg-white/5 pl-10 text-white placeholder:text-stone-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 h-11 w-full bg-amber-500 font-semibold text-stone-950 hover:bg-amber-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                  </Button>

                  <p className="text-xs leading-5 text-stone-500">
                    Todas las cuentas nuevas se crean automáticamente como estudiante.
                  </p>
                </form>
              )}

              {/* Pie del card */}
              <p className="mt-6 text-center text-xs text-stone-500">
                {mode === "register" ? (
                  <>
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                      className="font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                    >
                      Inicia sesion
                    </button>
                  </>
                ) : (
                  <>
                    ¿Eres nuevo aqui?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                      className="font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                    >
                      Crea tu cuenta
                    </button>
                  </>
                )}
                {" · "}
                <Link href="/" className="font-medium text-stone-400 hover:text-stone-200">
                  Volver al inicio
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <p className="text-xs leading-5 text-stone-400">{description}</p>
    </div>
  );
}
