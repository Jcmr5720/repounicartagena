"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleUserRound,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

type AuthMode = "login" | "register";

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
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
      router.replace(nextPath);
    }
  }, [nextPath, router, user]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

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

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

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
      if (!result.needsVerification) {
        router.replace(nextPath);
      }
      return;
    }

    setError(result.error || "No se pudo crear la cuenta.");
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const result = await loginWithGoogle(nextPath);

    if (!result.success) {
      setError(result.error || "No se pudo iniciar sesión con Google.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_35%),linear-gradient(135deg,_#06131a_0%,_#0c1f26_48%,_#112932_100%)] px-4 text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm shadow-2xl backdrop-blur">
          <Sparkles className="h-5 w-5 animate-pulse text-emerald-300" />
          Cargando autenticación...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_35%),linear-gradient(135deg,_#06131a_0%,_#0c1f26_48%,_#112932_100%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur hover:bg-white/10">
            <CircleUserRound className="h-4 w-4 text-emerald-300" />
            Repositorio REDS Colombia
          </Link>

          <div className="max-w-xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Auth con Supabase
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Accede con tu correo, registro simple y Google en un solo lugar.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Esta pantalla conecta directamente con Supabase Auth y deja un
              respaldo seguro de tu perfil no sensible en la tabla
              <span className="font-semibold text-slate-100">
                {" "}
                cartagena_usuario_usuario
              </span>
              .
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FeaturePill
              title="Registro rápido"
              description="Nombre, correo y usuario."
            />
            <FeaturePill
              title="Google OAuth"
              description="Un clic y listo."
            />
            <FeaturePill
              title="Respaldo limpio"
              description="Sin contraseñas ni datos sensibles."
            />
          </div>
        </section>

        <Card className="border-white/10 bg-white/90 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </p>
              <h2 className="text-2xl font-bold text-slate-950">
                {mode === "login"
                  ? "Entra con tu cuenta"
                  : "Regístrate en segundos"}
              </h2>
              <p className="text-sm text-slate-600">
                {mode === "login"
                  ? "Usa tu correo y contraseña. Si entras con Google, tu perfil se sincroniza automáticamente."
                  : "El respaldo se creará en la base de datos sin guardar tu contraseña."}
              </p>
            </div>

            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "register"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                Registro
              </button>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
              >
                <path
                  d="M21.35 11.1h-9.18v2.94h5.26c-.23 1.27-.96 2.35-2.05 3.07v2.55h3.32c1.94-1.79 3.05-4.43 3.05-7.56 0-.75-.07-1.48-.2-2z"
                  fill="#4285F4"
                />
                <path
                  d="M12.17 22c2.76 0 5.07-.91 6.76-2.48l-3.32-2.55c-.92.62-2.1.98-3.44.98-2.64 0-4.88-1.78-5.68-4.18H3.07v2.62A9.98 9.98 0 0 0 12.17 22z"
                  fill="#34A853"
                />
                <path
                  d="M6.49 13.77c-.2-.62-.32-1.27-.32-1.97s.12-1.35.32-1.97V7.21H3.07A9.98 9.98 0 0 0 2.2 11.8c0 1.63.39 3.17 1.08 4.53l3.21-2.56z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.17 5.03c1.5 0 2.84.52 3.9 1.55l2.92-2.92A9.86 9.86 0 0 0 12.17 2a9.98 9.98 0 0 0-9.1 5.21l3.42 2.59c.8-2.4 3.04-4.77 5.68-4.77z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </Button>

            {mode === "login" ? (
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login-identifier">Correo o usuario</Label>
                  <Input
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    value={loginForm.identifier}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        identifier: event.target.value,
                      }))
                    }
                    placeholder="tu@correo.com o tu_usuario"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Ingresando..." : "Entrar"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nombre</Label>
                  <Input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    value={registerForm.nombre}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        nombre: event.target.value,
                      }))
                    }
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Correo</Label>
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="tu@correo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-usuario">Usuario</Label>
                  <Input
                    id="register-usuario"
                    type="text"
                    autoComplete="username"
                    value={registerForm.usuario}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        usuario: event.target.value,
                      }))
                    }
                    placeholder="tu_usuario"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <Input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Crea una contraseña segura"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={registerForm.confirmPassword}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              ¿Necesitas volver al sitio principal?{" "}
              <Link href="/" className="font-semibold text-emerald-700 hover:underline">
                Ir al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FeaturePill({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100 shadow-lg backdrop-blur">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
