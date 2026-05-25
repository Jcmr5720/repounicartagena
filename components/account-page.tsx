"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, Save, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS, type User as AppUser } from "@/lib/types";
export function AccountPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                Acceso requerido
              </h2>
              <p className="mb-6 text-muted-foreground">
                Debes iniciar sesión para acceder a tu cuenta.
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

  return <AccountForm key={user.username} user={user} />;
}

function AccountForm({ user }: { user: AppUser }) {
  const { updateUser } = useAuth();
  const [email, setEmail] = useState(user.email);
  const [telefono, setTelefono] = useState(user.telefono);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");

    const result = await updateUser({ email, telefono });

    if (!result.success) {
      setSaveError(result.error || "No se pudieron guardar los cambios");
      setIsSaving(false);
      return;
    }

    setSaved(true);
    setIsSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mi cuenta</h1>
        <p className="mt-2 text-muted-foreground">
          Administra tu información personal
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Información del perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Usuario</Label>
              <div className="flex h-10 items-center rounded-md border border-border bg-muted/50 px-3 text-sm">
                {user.username}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Rol</Label>
              <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted/50 px-3 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                {ROLE_LABELS[user.role]}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@redscolombia.co"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+57 300 123 4567"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <div className="space-y-1">
              {saved && (
                <span className="text-sm text-green-600">
                  Cambios guardados correctamente
                </span>
              )}
              {saveError && (
                <span className="text-sm text-destructive">{saveError}</span>
              )}
            </div>
            <Button onClick={handleSave} className="ml-auto gap-2" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
