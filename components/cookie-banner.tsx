"use client";

import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { useCookieConsent } from "@/lib/cookie-consent-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CookieBanner() {
  const {
    acceptAllCookies,
    allowEssentialOnly,
    consentStatus,
    isHydrated,
    rejectNonEssentialCookies,
  } = useCookieConsent();

  if (!isHydrated || consentStatus !== "unknown") {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <Card className="mx-auto max-w-5xl border-border bg-background/95 shadow-2xl backdrop-blur">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                Uso de cookies
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Este sitio usa cookies esenciales para funcionar correctamente
                </h2>
                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  Usamos cookies tecnicas para mantener tu sesion, recordar ajustes
                  esenciales como la barra lateral y mejorar la experiencia. Tu
                  puedes aceptar todas, rechazar las no esenciales o permitir solo
                  las necesarias.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href="/politica-de-cookies"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Politica de cookies
                </Link>
                <Link
                  href="/privacidad"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Politica de privacidad
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[18rem] lg:flex-col">
              <Button onClick={acceptAllCookies} className="justify-center">
                Aceptar todas
              </Button>
              <Button onClick={rejectNonEssentialCookies} variant="outline" className="justify-center">
                Rechazar no esenciales
              </Button>
              <Button onClick={allowEssentialOnly} variant="ghost" className="justify-center">
                Solo esenciales
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={rejectNonEssentialCookies}
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <X className="h-4 w-4" />
            Cerrar y usar solo las necesarias
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
