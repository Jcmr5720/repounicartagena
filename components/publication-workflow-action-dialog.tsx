"use client";

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
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="workflow-comments">Observaciones</Label>
          <Textarea
            id="workflow-comments"
            rows={4}
            value={comments}
            onChange={(event) => onCommentsChange(event.target.value)}
            placeholder="Escribe una observacion clara para dejar evidencia del cambio."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || (requireComments && !comments.trim())}
          >
            {isSubmitting ? "Guardando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
