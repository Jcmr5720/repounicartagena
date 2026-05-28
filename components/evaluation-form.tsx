"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, RotateCcw, Save, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  EVALUATION_CRITERIA,
  EVALUATION_DECISION_LABELS,
  type EvaluationCriteriaKey,
  type EvaluationCriteriaScores,
  type EvaluationDecision,
  type PublicationEvaluation,
  type PublicationEvaluationInput,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface EvaluationFormProps {
  publicationId: string;
  initialEvaluation?: PublicationEvaluation;
  onSave: (input: PublicationEvaluationInput) => Promise<{ success: boolean; error?: string }>;
  onDecision: (input: PublicationEvaluationInput, action: EvaluationDecision) => Promise<{ success: boolean; error?: string }>;
}

function normalizeScores(scores?: EvaluationCriteriaScores): EvaluationCriteriaScores {
  return {
    calidad_academica:           scores?.calidad_academica,
    pertinencia_tematica:        scores?.pertinencia_tematica,
    claridad_redaccion:          scores?.claridad_redaccion,
    uso_metadatos_documentacion: scores?.uso_metadatos_documentacion,
  };
}

/* Barra de progreso del puntaje */
function ScoreBar({ score, max = 20 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-lime-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold ${pct >= 80 ? "text-emerald-700" : pct >= 60 ? "text-lime-700" : pct >= 40 ? "text-amber-700" : "text-red-600"}`}>
        {score}/{max}
      </span>
    </div>
  );
}

/* Selector de puntaje 1-5 con botones visuales */
function ScoreSelector({
  value,
  onChange,
  disabled,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === n ? undefined : n)}
          className={cn(
            "h-8 w-8 rounded-lg border text-xs font-semibold transition-all",
            value === n
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-label={`Puntaje ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function EvaluationForm({ publicationId, initialEvaluation, onSave, onDecision }: EvaluationFormProps) {
  const [criteriaScores, setCriteriaScores] = useState<EvaluationCriteriaScores>(
    normalizeScores(initialEvaluation?.criteria_scores),
  );
  const [decision, setDecision]       = useState<EvaluationDecision | "">(initialEvaluation?.decision ?? "");
  const [strengths, setStrengths]     = useState(initialEvaluation?.strengths ?? "");
  const [improvements, setImprovements] = useState(initialEvaluation?.improvements ?? "");
  const [comments, setComments]       = useState(initialEvaluation?.comments ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback]       = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setCriteriaScores(normalizeScores(initialEvaluation?.criteria_scores));
    setDecision(initialEvaluation?.decision ?? "");
    setStrengths(initialEvaluation?.strengths ?? "");
    setImprovements(initialEvaluation?.improvements ?? "");
    setComments(initialEvaluation?.comments ?? "");
  }, [initialEvaluation]);

  const totalScore = useMemo(
    () => EVALUATION_CRITERIA.reduce((t, c) => t + (typeof criteriaScores[c.key] === "number" ? (criteriaScores[c.key] as number) : 0), 0),
    [criteriaScores],
  );

  const hasCompleteCriteria = useMemo(
    () => EVALUATION_CRITERIA.every((c) => typeof criteriaScores[c.key] === "number"),
    [criteriaScores],
  );

  const buildPayload = (nextDecision?: EvaluationDecision | null): PublicationEvaluationInput => ({
    publication_id: publicationId,
    criteria_scores: criteriaScores,
    decision: nextDecision ?? (decision || null),
    strengths,
    improvements,
    comments,
  });

  const handleScoreChange = (key: EvaluationCriteriaKey, value: number | undefined) => {
    setCriteriaScores((cur) => ({ ...cur, [key]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    const result = await onSave(buildPayload(null));
    setFeedback(result.success
      ? { kind: "success", message: "Evaluación guardada correctamente en Supabase." }
      : { kind: "error", message: result.error || "No se pudo guardar la evaluación." });
    setIsSubmitting(false);
  };

  const handleDecision = async (action: EvaluationDecision) => {
    setIsSubmitting(true);
    setFeedback(null);
    const result = await onDecision(buildPayload(action), action);
    if (!result.success) {
      setFeedback({ kind: "error", message: result.error || "No se pudo registrar la decisión académica." });
      setIsSubmitting(false);
      return;
    }
    setDecision(action);
    setFeedback({ kind: "success", message: `Decisión "${EVALUATION_DECISION_LABELS[action].toLowerCase()}" registrada.` });
    setIsSubmitting(false);
  };

  const canApprove = hasCompleteCriteria && totalScore >= 16;
  const canReject  = hasCompleteCriteria && !!comments.trim();
  const canReturn  = hasCompleteCriteria && !!(improvements.trim() || comments.trim());

  return (
    <div className="space-y-5">

      {/* ── Encabezado con puntaje total ── */}
      <div className="rounded-2xl border border-border/60 bg-background p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Puntaje total acumulado</p>
          <Badge
            variant="secondary"
            className={cn("text-sm font-bold", totalScore >= 16 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}
          >
            {totalScore}/20
          </Badge>
        </div>
        <ScoreBar score={totalScore} max={20} />
        <p className="mt-2 text-xs text-muted-foreground">
          Se requiere mínimo <strong>16/20</strong> para aprobar. Puntaje actual:{" "}
          <strong className={totalScore >= 16 ? "text-emerald-700" : "text-amber-700"}>{totalScore}</strong>.
        </p>
      </div>

      {/* ── Criterios de evaluación ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Criterios de evaluación
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {EVALUATION_CRITERIA.map((criterion) => {
            const score = criteriaScores[criterion.key];
            const filled = typeof score === "number";
            return (
              <div
                key={criterion.key}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  filled ? "border-primary/20 bg-primary/[0.02]" : "border-border/60 bg-background",
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{criterion.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{criterion.description}</p>
                  </div>
                  {filled && (
                    <Badge className="shrink-0 bg-primary/10 text-primary hover:bg-primary/10 text-xs">
                      {score}/5
                    </Badge>
                  )}
                </div>
                <ScoreSelector
                  value={criteriaScores[criterion.key]}
                  onChange={(v) => handleScoreChange(criterion.key, v)}
                  disabled={isSubmitting}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Campos de texto ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Fortalezas</label>
          <Textarea
            rows={4}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="Describe los aspectos fuertes del recurso."
            disabled={isSubmitting}
            className="resize-none text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Mejoras sugeridas</label>
          <Textarea
            rows={4}
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="Indica ajustes o recomendaciones concretas."
            disabled={isSubmitting}
            className="resize-none text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Observaciones generales</label>
        <Textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Registra la justificación general de la evaluación."
          disabled={isSubmitting}
          className="resize-none text-sm"
        />
      </div>

      {/* ── Feedback ── */}
      {feedback && (
        <div className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
          feedback.kind === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-destructive/20 bg-destructive/8 text-destructive",
        )}>
          {feedback.kind === "success"
            ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {feedback.message}
        </div>
      )}

      {/* ── Acciones ── */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Decisión académica
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => void handleSave()}
            disabled={isSubmitting}
          >
            <Save className="h-3.5 w-3.5" />
            {isSubmitting ? "Guardando…" : "Guardar borrador"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={() => void handleDecision("approve")}
            disabled={isSubmitting || !canApprove}
            title={!canApprove ? "Completa todos los criterios y alcanza 16/20 para aprobar" : undefined}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprobar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="gap-2"
            onClick={() => void handleDecision("reject")}
            disabled={isSubmitting || !canReject}
            title={!canReject ? "Completa criterios y agrega observaciones para rechazar" : undefined}
          >
            <XCircle className="h-3.5 w-3.5" />
            Rechazar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => void handleDecision("return_with_observations")}
            disabled={isSubmitting || !canReturn}
            title={!canReturn ? "Completa criterios y agrega mejoras u observaciones" : undefined}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Devolver con observaciones
          </Button>
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          Aprobar requiere mínimo 16/20 y todos los criterios completos. Rechazar y devolver requieren observaciones.
        </p>
      </div>
    </div>
  );
}
