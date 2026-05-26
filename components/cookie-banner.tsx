"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
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
    <div className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-3">
      <Card className="mx-auto max-w-4xl border-border/80 bg-background/98 shadow-xl backdrop-blur">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                Uso de cookies
              </div>
              <div>
                <h2 className="text-sm font-semibold leading-5 text-foreground sm:text-base">
                  Cookies esenciales para funcionar correctamente
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                  Guardamos solo lo necesario para la sesion y preferencias
                  basicas. Puedes aceptar, rechazar o dejar solo las esenciales.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
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

            <div className="flex flex-wrap gap-2 sm:min-w-[16rem] sm:justify-end">
              <Button onClick={acceptAllCookies} size="sm" className="justify-center">
                Aceptar todas
              </Button>
              <Button
                onClick={rejectNonEssentialCookies}
                variant="outline"
                size="sm"
                className="justify-center"
              >
                Rechazar no esenciales
              </Button>
              <Button
                onClick={allowEssentialOnly}
                variant="ghost"
                size="sm"
                className="justify-center"
              >
                Solo esenciales
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
