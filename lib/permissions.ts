import type {
  Publication,
  PublicationWorkflowStatus,
  User,
  UserRole,
} from "@/lib/types";

type PublicationLike = Pick<Publication, "owner_id" | "workflow_status">;

function normalizeRole(role: UserRole | null | undefined) {
  if (role === "moderador") {
    return "evaluador";
  }

  return role;
}

export function getEffectiveRole(user: User | null | undefined) {
  return normalizeRole(user?.role);
}

export function isAdmin(user: User | null | undefined) {
  return getEffectiveRole(user) === "admin";
}

export function isDocente(user: User | null | undefined) {
  return getEffectiveRole(user) === "docente";
}

export function isEvaluador(user: User | null | undefined) {
  return getEffectiveRole(user) === "evaluador";
}

export function canUploadDocuments(user: User | null | undefined) {
  const role = getEffectiveRole(user);
  return role === "docente" || role === "admin";
}

export function canViewAllDocuments(user: User | null | undefined) {
  const role = getEffectiveRole(user);
  return role === "admin" || role === "docente" || role === "evaluador";
}

export function canAccessEvaluation(user: User | null | undefined) {
  return isAdmin(user) || isEvaluador(user);
}

export function canAccessAdmin(user: User | null | undefined) {
  return isAdmin(user);
}

export function canManageDocuments(user: User | null | undefined) {
  return canUploadDocuments(user);
}

export function canUseFavorites(user: User | null | undefined) {
  return !!user;
}

function canOwnerMutateDocument(
  user: User | null | undefined,
  document: PublicationLike,
  allowedStatuses: PublicationWorkflowStatus[],
) {
  if (!user || getEffectiveRole(user) !== "docente") {
    return false;
  }

  return (
    document.owner_id === user.id &&
    allowedStatuses.includes(document.workflow_status)
  );
}

export function canEditDocument(
  user: User | null | undefined,
  document: PublicationLike,
) {
  if (isAdmin(user)) {
    return true;
  }

  return canOwnerMutateDocument(user, document, [
    "borrador",
    "ajustes_solicitados",
  ]);
}

export function canDeleteDocument(
  user: User | null | undefined,
  document: PublicationLike,
) {
  if (isAdmin(user)) {
    return true;
  }

  return canOwnerMutateDocument(user, document, [
    "borrador",
    "ajustes_solicitados",
    "rechazada",
  ]);
}

export function canSubmitForReview(
  user: User | null | undefined,
  document: PublicationLike,
) {
  if (isAdmin(user)) {
    return true;
  }

  return canOwnerMutateDocument(user, document, [
    "borrador",
    "ajustes_solicitados",
  ]);
}

export function canSendToEvaluation(
  user: User | null | undefined,
  document: Pick<Publication, "workflow_status">,
) {
  return (
    (isDocente(user) || isAdmin(user)) &&
    (document.workflow_status === "borrador" ||
      document.workflow_status === "ajustes_solicitados")
  );
}

export function canStartEvaluation(
  user: User | null | undefined,
  document: Pick<Publication, "workflow_status">,
) {
  return (
    (isEvaluador(user) || isAdmin(user)) &&
    document.workflow_status === "enviada"
  );
}

export function canApprovePublication(
  user: User | null | undefined,
  document: Pick<Publication, "workflow_status">,
) {
  return (
    (isEvaluador(user) || isAdmin(user)) &&
    (document.workflow_status === "enviada" ||
      document.workflow_status === "en_evaluacion")
  );
}

export function canRejectPublication(
  user: User | null | undefined,
  document: Pick<Publication, "workflow_status">,
) {
  return canApprovePublication(user, document);
}

export function canReturnWithObservations(
  user: User | null | undefined,
  document: Pick<Publication, "workflow_status">,
) {
  return canApprovePublication(user, document);
}

export function canPublishPublication(
  user: User | null | undefined,
  document: Pick<Publication, "workflow_status">,
) {
  return isAdmin(user) && document.workflow_status === "aprobada";
}

export function canSuspendPublication(
  user: User | null | undefined,
  document: Pick<Publication, "workflow_status">,
) {
  return isAdmin(user) && document.workflow_status === "publicada";
}
