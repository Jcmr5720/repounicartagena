"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Accede a tu cuenta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            El registro y el acceso ahora estan en una pagina dedicada para que
            puedas entrar de forma mas rapida y sencilla.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth">Ir al formulario</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
