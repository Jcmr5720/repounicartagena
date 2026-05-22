import type { Document, User } from "@/lib/types";

export function isAdmin(user: User | null | undefined) {
  return user?.role === "admin";
}

export function isModerator(user: User | null | undefined) {
  return user?.role === "moderador";
}

export function canViewAllDocuments(user: User | null | undefined) {
  return isAdmin(user) || isModerator(user);
}

export function canManageDocuments(user: User | null | undefined) {
  return isAdmin(user) || user?.role === "estudiante";
}

export function canSuspendDocuments(user: User | null | undefined) {
  return isAdmin(user) || isModerator(user);
}

export function canEditDocument(
  user: User | null | undefined,
  document: Pick<Document, "owner_id" | "status">,
) {
  if (!user) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  if (isModerator(user)) {
    return false;
  }

  return document.owner_id === user.id && document.status === "disponible";
}

export function canDeleteDocument(
  user: User | null | undefined,
  document: Pick<Document, "owner_id" | "status">,
) {
  if (!user) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  if (isModerator(user)) {
    return false;
  }

  return document.owner_id === user.id && document.status === "disponible";
}
