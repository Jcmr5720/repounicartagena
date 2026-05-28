"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PublicationWorkflowActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  comments: string;
  requireComments?: boolean;
  onCommentsChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function PublicationWorkflowActionDialog({
  open,
  title,
  description,
  confirmLabel,
  comments,
  requireComments = false,
  onCommentsChange,
  onClose,
  onConfirm,
  isSubmitting = false,
}: PublicationWorkflowActionDialogProps) {
  const isDestructive = confirmLabel.toLowerCase().includes("suspender");
  const canConfirm = !isSubmitting && (!requireComments || !!comments.trim());

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="sm:max-w-md">

        {/* Ícono de acción */}
        <div className={`mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl ${
          isDestructive ? "bg-destructive/10" : "bg-emerald-100"
        }`}>
          {isDestructive
            ? <AlertTriangle className="h-6 w-6 text-destructive" />
            : <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
        </div>

        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="workflow-comments" className="text-sm font-medium text-foreground">
            Observaciones{requireComments && <span className="ml-1 text-destructive">*</span>}
          </Label>
          <Textarea
            id="workflow-comments"
            rows={4}
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            placeholder="Escribe una observación clara para dejar evidencia del cambio."
            className="resize-none text-sm"
          />
          {requireComments && !comments.trim() && (
            <p className="text-xs text-destructive">Este campo es obligatorio para continuar.</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            variant={isDestructive ? "destructive" : "default"}
            className={!isDestructive ? "flex-1 bg-emerald-600 hover:bg-emerald-500" : "flex-1"}
          >
            {isSubmitting ? "Guardando…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
