"use client";

import { useEffect, useMemo, useState } from "react";
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

interface EvaluationFormProps {
  publicationId: string;
  initialEvaluation?: PublicationEvaluation;
  onSave: (
    input: PublicationEvaluationInput,
  ) => Promise<{ success: boolean; error?: string }>;
  onDecision: (
    input: PublicationEvaluationInput,
    action: EvaluationDecision,
  ) => Promise<{ success: boolean; error?: string }>;
}

function normalizeScores(
  scores?: EvaluationCriteriaScores,
): EvaluationCriteriaScores {
  return {
    calidad_academica: scores?.calidad_academica,
    pertinencia_tematica: scores?.pertinencia_tematica,
    claridad_redaccion: scores?.claridad_redaccion,
    uso_metadatos_documentacion: scores?.uso_metadatos_documentacion,
  };
}

export function EvaluationForm({
  publicationId,
  initialEvaluation,
  onSave,
  onDecision,
}: EvaluationFormProps) {
  const [criteriaScores, setCriteriaScores] = useState<EvaluationCriteriaScores>(
    normalizeScores(initialEvaluation?.criteria_scores),
  );
  const [decision, setDecision] = useState<EvaluationDecision | "">(
    initialEvaluation?.decision ?? "",
  );
  const [strengths, setStrengths] = useState(initialEvaluation?.strengths ?? "");
  const [improvements, setImprovements] = useState(
    initialEvaluation?.improvements ?? "",
  );
  const [comments, setComments] = useState(initialEvaluation?.comments ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setCriteriaScores(normalizeScores(initialEvaluation?.criteria_scores));
    setDecision(initialEvaluation?.decision ?? "");
    setStrengths(initialEvaluation?.strengths ?? "");
    setImprovements(initialEvaluation?.improvements ?? "");
    setComments(initialEvaluation?.comments ?? "");
  }, [initialEvaluation]);

  const totalScore = useMemo(
    () =>
      EVALUATION_CRITERIA.reduce((total, criterion) => {
        const score = criteriaScores[criterion.key];
        return total + (typeof score === "number" ? score : 0);
      }, 0),
    [criteriaScores],
  );

  const hasCompleteCriteria = useMemo(
    () =>
      EVALUATION_CRITERIA.every(
        (criterion) => typeof criteriaScores[criterion.key] === "number",
      ),
    [criteriaScores],
  );

  const buildPayload = (
    nextDecision?: EvaluationDecision | null,
  ): PublicationEvaluationInput => ({
    publication_id: publicationId,
    criteria_scores: criteriaScores,
    decision: nextDecision ?? (decision || null),
    strengths,
    improvements,
    comments,
  });

  const handleScoreChange = (key: EvaluationCriteriaKey, value: string) => {
    setCriteriaScores((current) => ({
      ...current,
      [key]: value ? Number(value) : undefined,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    const result = await onSave(buildPayload(null));
    if (!result.success) {
      setFeedback({
        kind: "error",
        message: result.error || "No se pudo guardar la evaluacion.",
      });
      setIsSubmitting(false);
      return;
    }

    setFeedback({
      kind: "success",
      message: "La evaluacion academica quedo guardada en Supabase.",
    });
    setIsSubmitting(false);
  };

  const handleDecision = async (action: EvaluationDecision) => {
    setIsSubmitting(true);
    setFeedback(null);

    const result = await onDecision(buildPayload(action), action);
    if (!result.success) {
      setFeedback({
        kind: "error",
        message: result.error || "No se pudo registrar la decision academica.",
      });
      setIsSubmitting(false);
      return;
    }

    setDecision(action);
    setFeedback({
      kind: "success",
      message: `La decision ${EVALUATION_DECISION_LABELS[action].toLowerCase()} quedo registrada.`,
    });
    setIsSubmitting(false);
  };

  const canApprove = hasCompleteCriteria && totalScore >= 16;
  const canReject = hasCompleteCriteria && !!comments.trim();
  const canReturn = hasCompleteCriteria && !!(improvements.trim() || comments.trim());

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Evaluacion academica formal
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Diligencia la rubrica, guarda la evidencia y luego emite una decision.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          Total actual: {totalScore}/20
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {EVALUATION_CRITERIA.map((criterion) => (
          <div
            key={criterion.key}
            className="rounded-xl border border-border bg-background p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{criterion.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {criterion.description}
                </p>
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={criteriaScores[criterion.key]?.toString() ?? ""}
                onChange={(event) => handleScoreChange(criterion.key, event.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Puntaje</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value.toString()}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Fortalezas</label>
          <Textarea
            rows={4}
            value={strengths}
            onChange={(event) => setStrengths(event.target.value)}
            placeholder="Describe los aspectos fuertes del recurso."
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Mejoras</label>
          <Textarea
            rows={4}
            value={improvements}
            onChange={(event) => setImprovements(event.target.value)}
            placeholder="Indica ajustes o recomendaciones concretas."
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Observaciones generales
          </label>
          <Textarea
            rows={4}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Registra la justificacion general de la evaluacion."
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Concepto final
          </label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={decision}
            onChange={(event) =>
              setDecision(event.target.value as EvaluationDecision | "")
            }
            disabled={isSubmitting}
          >
            <option value="">Selecciona concepto</option>
            <option value="approve">Aprobar</option>
            <option value="reject">Rechazar</option>
            <option value="return_with_observations">
              Devolver con observaciones
            </option>
          </select>
          <p className="text-xs text-muted-foreground">
            El concepto queda persistido junto con la rubrica y el puntaje total.
          </p>
        </div>
      </div>

      {feedback ? (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            feedback.kind === "success"
              ? "bg-green-50 text-green-800"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleSave()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar evaluacion"}
          </Button>
          <Button
            type="button"
            onClick={() => void handleDecision("approve")}
            disabled={isSubmitting || !canApprove}
          >
            Aprobar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleDecision("reject")}
            disabled={isSubmitting || !canReject}
          >
            Rechazar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleDecision("return_with_observations")}
            disabled={isSubmitting || !canReturn}
          >
            Devolver con observaciones
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Para aprobar se exige un minimo de 16/20. Rechazar requiere justificacion.
          Devolver exige mejoras u observaciones.
        </p>
      </div>
    </div>
  );
}
